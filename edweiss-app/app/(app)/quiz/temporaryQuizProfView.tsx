import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import React from 'react';

import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TSafeArea from '@/components/core/containers/TSafeArea';
import TView from '@/components/core/containers/TView';
import { LectureQuizProfView } from '@/components/quiz/LectureQuizComponents';
import { CollectionOf, Document } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzes, QuizzesAttempts } from '@/model/quizzes';
import { t } from 'i18next';

export const TemporaryQuizProfViewSignature: ApplicationRouteSignature<{
	courseId: string, lectureId: string, lectureEventId: string
	prefetchedQuizEvent: Document<LectureDisplay.QuizLectureEvent> | undefined
}> = {
	path: "/(app)/quiz/temporaryQuizProfView" as any
}

const TemporaryQuizProfView: ApplicationRoute = () => {
	const { courseId, lectureId, lectureEventId, prefetchedQuizEvent } = useRouteParameters(TemporaryQuizProfViewSignature)


	const pathToEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToEvents + "/" + lectureEventId + "/attempts";

	const [quizEvent, _] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEventBase>(pathToEvents), lectureEventId as string, prefetchedQuizEvent);


	return (<LectureQuizProfView courseId={courseId} lectureEventId={lectureEventId} lectureId={lectureId} pathToAttempts={pathToAttempts} quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>}></LectureQuizProfView>);

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
	return (<TSafeArea>
		<TView mb={'md'} justifyContent='center' style={{ height: "100%" }}>
			<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"}>


				<TView >
					<TText size={18} mb={'sm'} bold>
						{exercise.question}
					</TText>
				</TView>

				<TText size={"sm"} color='subtext0' mt={-8}>
					{numberOfAttempts} {t('quiz:quiz_display.answer')}
				</TText>

				<TView mt={24}>
					<DisplayTrueFalseBars exercise={exercise} percentage={distribution[1]} />
				</TView>

			</TView>
		</TView>
	</TSafeArea>

	);
};

const DisplayTrueFalseBars: ReactComponent<{ exercise: Quizzes.TF, percentage: number }> = (props) => {

	return (
		<TView flexDirection='row' flexColumnGap={'md'} alignItems='center' mb={"sm"}>
			<TText size={"sm"} bold color='green'>
				{t('quiz:quiz_display.true')}
			</TText>

			<TView flex={1} backgroundColor='peach' radius='md' style={{ position: "relative", overflow: "hidden" }}>
				<TView backgroundColor={props.exercise.answer ? 'green' : 'peach'} style={{ width: `${props.percentage}%` }} py={"md"}>

				</TView>

				<TView flexDirection='row' justifyContent='space-between' alignItems='center' px={"sm"} style={{ position: "absolute", width: "100%", height: "100%" }}>
					<TText size={'sm'} bold color='crust'>
						{props.percentage}%
					</TText>

					<TText size={'sm'} bold color='crust'>
						{100 - props.percentage}%
					</TText>
				</TView>
			</TView>

			<TText size={"sm"} bold color='peach'>
				{t('quiz:quiz_display.false')}
			</TText>
		</TView>

	);


};


export const DisplayMCQProportions: ReactComponent<{ distribution: number[], exercise: Quizzes.MCQ, numberOfAttempts: number }> = ({ distribution, exercise, numberOfAttempts }) => {
	return (
		<>
			<TView justifyContent='center' alignItems='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"}>

					<TText size={18} mb={'sm'} bold>
						{exercise.question}
					</TText>

					<TText size={"sm"} color='subtext0' mt={-8} mb={'sm'}>
						{numberOfAttempts} {t('quiz:quiz_display.answer')}
					</TText>

					<For each={exercise.propositions}>
						{(proposition, propositionIndex) => {
							return (
								<TView style={{ position: "relative" }} key={proposition.id} flexDirection='row' flexColumnGap={'md'} alignItems='center' mb={"sm"}>

									<TText color='overlay0' size={'sm'} bold>
										Option {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(propositionIndex)}
									</TText>

									<TView backgroundColor='blue' style={{ width: `${distribution[propositionIndex]}%` }} radius='xs' py='md'>
									</TView>

									<TText color='overlay0' size={'sm'} bold>
										{distribution[propositionIndex]}%
									</TText>

								</TView>
							);
						}}
					</For>
				</TView>
			</TView >
		</>
		// <TSafeArea>
		// </TSafeArea >

	);
};

export function getMCQDistribution(studentAttempts: QuizzesAttempts.MCQAnswersIndices[], numberOfPropositions: number): number[] {
	const numberOfAttempts = studentAttempts.length;
	let numberOfAnswers = 0
	let propositionDistribution = Array(numberOfPropositions).fill(0);
	if (studentAttempts == undefined || studentAttempts.length <= 0) {
		return propositionDistribution
	}

	for (let index = 0; index < numberOfAttempts; index++) { // for each attempt of this MCQ

		const attempt = studentAttempts[index];

		const selectedPropositionIndices = attempt.value

		selectedPropositionIndices.forEach((propositionIndex: number) => {
			if (propositionIndex >= 0 && propositionIndex < numberOfPropositions) {
				propositionDistribution[propositionIndex]++;
				numberOfAnswers++
			} else {
				console.log(`Warning: in MCQ, Invalid proposition index ${propositionIndex} found in attempt`);
			}
		});

	}
	return propositionDistribution.map(p => (p * 100) / numberOfAnswers);
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
