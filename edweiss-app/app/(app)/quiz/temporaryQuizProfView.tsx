import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TSafeArea from '@/components/core/containers/TSafeArea';
import TView from '@/components/core/containers/TView';
import { CollectionOf, Document } from '@/config/firebase';
import { useDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzes, LectureQuizzesAttempts, QuizzesAttempts } from '@/model/quizzes';
import { router } from 'expo-router';
import { useEffect } from 'react';

export const TemporaryQuizProfViewSignature: ApplicationRouteSignature<{
	courseId: string, lectureId: string, lectureEventId: string
	prefetchedQuizEvent: Document<LectureDisplay.LectureEvent> | undefined
}> = {
	path: "/(app)/quiz/temporaryQuizProfView" as any
}

const TemporaryQuizProfView: ApplicationRoute = () => {
	const { courseId, lectureId, lectureEventId, prefetchedQuizEvent } = useRouteParameters(TemporaryQuizProfViewSignature)
	const pathToEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToEvents + "/" + lectureEventId + "/attempts"

	const [quizEvent, loading] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEvent>(pathToEvents), lectureEventId as string, prefetchedQuizEvent);
	const studentAttempts = useDocs(CollectionOf<LectureQuizzesAttempts.LectureQuizAttempt>(pathToAttempts));

	const quiz = quizEvent?.data.quizModel

	useEffect(() => {
		if (quiz?.exercise == undefined) {
			return;
		}
		else if (quizEvent?.data.done) {
			router.back();
		}
	}, [quizEvent]);
	if (quizEvent == undefined || studentAttempts == undefined) {
		return <TActivityIndicator testID='undefined-quiz-loading-prof' />;
	}

	if (quiz?.showResultToStudents && studentAttempts.length > 0) {
		const studentAttemptsData = studentAttempts.map(doc => doc.data);
		if (studentAttemptsData == undefined) {
			return <TActivityIndicator testID='attempts-empty' />
		}

		return (
			<>
				<TSafeArea>
					<SingleDistributionDisplay exercise={quiz.exercise} exerciseAttempts={studentAttemptsData} />
				</TSafeArea>

			</>
		);
	}
	else if (quizEvent != undefined && !quizEvent.data.quizModel.showResultToStudents) {
		return (
			<>
				<RouteHeader disabled />
				<TSafeArea>
					<TView>
						<TText> Quiz is live! </TText>
					</TView>
				</TSafeArea>

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


export const ResultProfView: ReactComponent<{ studentAttempts: QuizzesAttempts.Answer[], quiz: LectureQuizzes.LectureQuiz, testID: string }> = ({ studentAttempts, quiz, testID }) => {
	return (<SingleDistributionDisplay exercise={quiz.exercise} exerciseAttempts={studentAttempts} />)

};
export const SingleDistributionDisplay: ReactComponent<{ exercise: Quizzes.Exercise, exerciseAttempts: QuizzesAttempts.Answer[], }> = ({ exercise, exerciseAttempts }) => {

	if (exercise.type == 'MCQ') {
		const distribution = getMCQDistribution(exerciseAttempts as QuizzesAttempts.MCQAnswersIndices[], exercise.propositions.length);
		return (
			<DisplayMCQProportions distribution={distribution} exercise={exercise} numberOfAttempts={exerciseAttempts.length} />
		);
	}
	else if (exercise.type == 'TF') {
		const distribution = getTFDistribution(exerciseAttempts as QuizzesAttempts.TFAnswer[]);
		return (
			<DisplayTFProportions distribution={distribution} exercise={exercise} numberOfAttempts={exerciseAttempts.length} />
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
export const DisplayTFProportions: ReactComponent<{ distribution: number[]; exercise: Quizzes.TF, numberOfAttempts: number }> = ({ distribution, exercise, numberOfAttempts }) => {
	return (

		<TView mb={'md'}>
			<TText size={'lg'}>
				{exercise.question}
			</TText>

			<TView backgroundColor={exercise.answer ? 'green' : 'peach'} style={{ width: `${distribution[1]}%` }} radius='xs' p='md' ml='sm'>
				<TText color='crust'>
					True : {distribution[1]} %
				</TText>
			</TView>

			<TView backgroundColor={exercise.answer ? 'peach' : 'green'} style={{ width: `${distribution[0]}%` }} radius='xs' p='md' ml='sm' mt='sm'>
				<TText color='crust'>
					False : {distribution[0]} %
				</TText>
			</TView>

			<TText>
				Number of answers : {numberOfAttempts}
			</TText>


			{/* <TText>
				Undecided : {distribution[2]} %
			</TText> */}
		</TView>

	);
};

export const DisplayMCQProportions: ReactComponent<{ distribution: number[], exercise: Quizzes.MCQ, numberOfAttempts: number }> = ({ distribution, exercise, numberOfAttempts }) => {
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
			<TText>
				Number of answers : {numberOfAttempts}
			</TText>
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
