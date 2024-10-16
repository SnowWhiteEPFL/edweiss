import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import { CollectionOf } from '@/config/firebase';
import { useDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

const TempQuizProfView: ApplicationRoute = () => {
	const { quizId, path } = useLocalSearchParams();
	const [quiz, loading] = usePrefetchedDynamicDoc(CollectionOf<Quizzes.Quiz>(path as string), quizId as string, undefined);
	const studentAttempts = useDocs(CollectionOf<QuizzesAttempts.QuizAttempt>(path + "/" + quizId + "/attempts"));

	useEffect(() => {
		if (quiz == undefined) {
			return;
		}

		else if (quiz.data.ended) {
			router.back();
		}


	}, [quiz]);

	if (quiz != undefined && quiz.data.showResultToStudents && studentAttempts != undefined && studentAttempts.length > 0) {

		return (
			<>
				<ResultProfView studentAttempts={studentAttempts.map(doc => doc.data)} quiz={quiz.data}></ResultProfView>
			</>
		);
	}
	else if (quiz != undefined && !quiz.data.showResultToStudents) {
		return (
			<>
				<RouteHeader disabled />

				<TView>
					<TText> Quiz is live! </TText>
				</TView>
			</>
		);
	}
	else {
		return (<>
			<TView>
				<TText>
					An error occured!
				</TText>
			</TView>
		</>);
	}

};
export default TempQuizProfView;


const ResultProfView: ReactComponent<{ studentAttempts: QuizzesAttempts.QuizAttempt[], quiz: Quizzes.Quiz; }> = ({ studentAttempts, quiz }) => {
	let distribution = [] as number[];
	if (quiz.exercises[0].type == 'MCQ') {
		distribution = getMCQDistribution(studentAttempts, quiz.exercises[0].numberOfAnswers);
		return (<>
			<DisplayMCQProportions distribution={distribution} quiz={quiz} />
		</>);
	}
	else if (quiz.exercises[0].type == 'TF') {
		distribution = getTFDistribution(studentAttempts);
		return (<>
			<DisplayTFProportions distribution={distribution} quiz={quiz} />
		</>);
	}
	else {
		return (
			<>
				<TText>
					Unrecognised exercise type !
				</TText>
			</>
		);
	}

};

const DisplayTFProportions: ReactComponent<{ distribution: number[]; quiz: Quizzes.Quiz; }> = ({ distribution, quiz }) => {
	return (
		<>
			<TView>
				<TText size={'lg'}>
					{quiz.exercises[0].question}
				</TText>
				<TText>
					False : {distribution[0]} %
				</TText>
				<TText>
					True : {distribution[1]} %
				</TText>
				<TText>
					Undecided : {distribution[2]} %
				</TText>
			</TView>
		</>
	);
};

const DisplayMCQProportions: ReactComponent<{ distribution: number[]; quiz: Quizzes.Quiz; }> = ({ distribution, quiz }) => {
	return (
		<>
			<TView>
				<TText size={'lg'}>
					{quiz.exercises[0].question}
				</TText>
				<For each={distribution}>
					{(proposition, propIndex) => {

						return (
							<>
								<TText>
									Proposition {propIndex} : {distribution[propIndex]} %
								</TText>
							</>
						);
					}}
				</For>
			</TView>
		</>
	);
};

export function getMCQDistribution(studentAttempts: QuizzesAttempts.QuizAttempt[], numberOfPropositions: number): number[] {
	const numberOfAttempts = studentAttempts.length;
	let propositionDistribution = Array(numberOfPropositions).fill(0);

	for (let index = 0; index < numberOfAttempts; index++) {

		const attempt = studentAttempts[index];
		if (attempt.answers[0].type == 'TFAnswer') {
			console.log("error: passed TF answers to MCQ distribution function");
			return [];
		}
		const selectedPropositionIndices = attempt.answers[0].value;

		selectedPropositionIndices.forEach((propositionIndex: number) => {
			if (propositionIndex >= 0 && propositionIndex < numberOfPropositions) {
				propositionDistribution[propositionIndex] += 1;
			} else {
				console.log(`Warning: Invalid proposition index ${propositionIndex} found in attempt`);
			}
		});

	}
	return propositionDistribution.map(p => (p * 100) / numberOfAttempts);
}

export function getTFDistribution(studentAttempts: QuizzesAttempts.QuizAttempt[]): number[] {
	const numberOfAttempts = studentAttempts.length;
	let TFDistribution = [0, 0, 0]; // Index 0 for False, Index 1 for True

	for (let index = 0; index < numberOfAttempts; index++) {

		const attempt = studentAttempts[index];

		// Ensure that this function only processes True/False answers
		if (attempt.answers[0].type != 'TFAnswer') {
			console.log("error: passed non-TF answers to TF distribution function");
			return [];
		}

		// We assume attempt.answers[0].value is a boolean (true/false)
		const selectedAnswer = attempt.answers[0].value;  // Boolean: true = True, false = False

		// Increment the appropriate count in the tfDistribution array
		if (selectedAnswer == true) {
			TFDistribution[1] += 1; // Increment True count
		} else if (selectedAnswer == false) {
			TFDistribution[0] += 1; // Increment False count
		}
		else if (selectedAnswer == undefined) {
			TFDistribution[2] += 1; // Undefined (unanswered)
		} else {
			console.log(`Warning: Invalid value found in attempt`);
		}
	}

	// Convert the distribution to percentages
	return TFDistribution.map(p => (p * 100) / numberOfAttempts);
}
