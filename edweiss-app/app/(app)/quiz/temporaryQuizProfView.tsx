import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import { CollectionOf } from '@/config/firebase';
import { useDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

const TemporaryQuizProfView: ApplicationRoute = () => {
	const { quizId, path } = useLocalSearchParams();
	const [quiz, loading] = usePrefetchedDynamicDoc(CollectionOf<Quizzes.Quiz>(path as string), quizId as string, undefined);
	const studentAttempts = useDocs(CollectionOf<QuizzesAttempts.QuizAttempt>(path + "/" + quizId + "/attempts"));

	useEffect(() => {
		if (quiz?.data.exercises == undefined) {
			return;
		}
		else if (quiz.data.ended) {
			router.back();
		}
	}, [quiz]);
	if (quiz == undefined || studentAttempts == undefined) {
		return <TActivityIndicator testID='undefined-quiz-loading-prof' />;
	}

	if (quiz?.data?.showResultToStudents && studentAttempts.length > 0) {
		const studentAttemptsData = studentAttempts.map(doc => doc.data);
		if (studentAttemptsData == undefined) {
			return <TActivityIndicator testID='attempts-empty' />
		}

		return (
			<ResultProfView studentAttempts={studentAttemptsData} quiz={quiz.data} testID='result-prof-view' />
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
		return (
			<TView>
				<TText>
					An error occured!
				</TText>
			</TView>
		);
	}

};
export default TemporaryQuizProfView;


export const ResultProfView: ReactComponent<{ studentAttempts: QuizzesAttempts.QuizAttempt[], quiz: Quizzes.Quiz, testID: string }> = ({ studentAttempts, quiz, testID }) => {
	return (<For each={quiz.exercises}>
		{
			(thisExercise, index) => {
				return (<SingleDistributionDisplay exercise={thisExercise} exerciseAttempts={studentAttempts} index={index} key={index} />)
			}
		}
	</For>)
};
export const SingleDistributionDisplay: ReactComponent<{ exercise: Quizzes.Exercise, exerciseAttempts: QuizzesAttempts.QuizAttempt[], index: number }> = ({ exercise, exerciseAttempts, index }) => {

	const thisExerciseAttempts = exerciseAttempts.map(attempt => attempt.answers[index])
	if (exercise.type == 'MCQ') {
		const distribution = getMCQDistribution(thisExerciseAttempts as QuizzesAttempts.MCQAnswersIndices[], exercise.propositions.length);
		return (
			<DisplayMCQProportions distribution={distribution} exercise={exercise} />
		);
	}
	else if (exercise.type == 'TF') {
		const distribution = getTFDistribution(thisExerciseAttempts as QuizzesAttempts.TFAnswer[]);
		return (
			<DisplayTFProportions distribution={distribution} exercise={exercise} />
		);
	}
	else {
		return (
			<TText>
				Unrecognised exercise type !
			</TText>
		);
	}
};
export const DisplayTFProportions: ReactComponent<{ distribution: number[]; exercise: Quizzes.TF; }> = ({ distribution, exercise }) => {
	return (

		<TView mb={'md'}>
			<TText size={'lg'}>
				{exercise.question}
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

	);
};

export const DisplayMCQProportions: ReactComponent<{ distribution: number[]; exercise: Quizzes.MCQ }> = ({ distribution, exercise }) => {
	return (
		<TView mb={'md'}>
			<TText size={'lg'}>
				{exercise.question}
			</TText>
			<For each={distribution}>
				{(proposition, propIndex) => {
					console.log(distribution.length)
					return (<TText>{`Proposition ${propIndex + 1} : ${proposition} %`}</TText>);
				}}
			</For>
		</TView>

	);
};

export function getMCQDistribution(studentAttempts: QuizzesAttempts.MCQAnswersIndices[], numberOfPropositions: number): number[] {
	const numberOfAttempts = studentAttempts.length;
	let propositionDistribution = Array(numberOfPropositions).fill(0);
	if (studentAttempts == undefined || studentAttempts.length <= 0) {
		return propositionDistribution
	}

	for (let index = 0; index < numberOfAttempts; index++) { // for each attempt of this MCQ

		const attempt = studentAttempts[index];

		const selectedPropositionIndices = attempt.value

		selectedPropositionIndices.forEach((propositionIndex: number) => {
			if (propositionIndex >= 0 && propositionIndex < numberOfPropositions) {
				propositionDistribution[propositionIndex] += 1;
			} else {
				console.log(`Warning: in MCQ, Invalid proposition index ${propositionIndex} found in attempt`);
			}
		});

	}
	return propositionDistribution.map(p => (p * 100) / numberOfAttempts);
}

export function getTFDistribution(studentAttempts: QuizzesAttempts.TFAnswer[]): number[] {
	const numberOfAttempts = studentAttempts.length;
	let TFDistribution = [0, 0, 0]; // Index 0 for False, Index 1 for True
	if (studentAttempts == undefined || studentAttempts.length <= 0) {
		return TFDistribution
	}

	for (let index = 0; index < numberOfAttempts; index++) {

		const attempt = studentAttempts[index];

		const selectedAnswer = attempt.value;  // Boolean: true = True, false = False

		// Increment the appropriate count in the tfDistribution array
		if (selectedAnswer == true) {
			TFDistribution[1] += 1; // Increment True count
		} else if (selectedAnswer == false) {
			TFDistribution[0] += 1; // Increment False count
		}
		else if (selectedAnswer == undefined) {
			TFDistribution[2] += 1; // Undefined (unanswered)
		} else {
			console.log(`Warning: in TF, Invalid value found in attempt`);
		}
	}

	// Convert the distribution to percentages
	return TFDistribution.map(p => (p * 100) / numberOfAttempts);
}
