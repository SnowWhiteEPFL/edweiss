import { SingleDistributionDisplay } from '@/app/(app)/quiz/temporaryQuizProfView';
import { callFunction, CollectionOf, Document } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { useDoc, useDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzesAttempts, QuizzesAttempts } from '@/model/quizzes';
import { Redirect } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import Hourglass from '../animations/Hourglass';
import TView from '../core/containers/TView';
import TActivityIndicator from '../core/TActivityIndicator';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';
import { MCQDisplay, MCQResultDisplay, TFDisplay, TFResultDisplay } from './QuizComponents';

export const LectureQuizView: ReactComponent<{ courseId: string, lectureId: string, lectureEventId: string }> = ({ courseId, lectureId, lectureEventId }) => {
	const pathToEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToEvents + "/" + lectureEventId + "/attempts";

	const { user } = useUser()
	const [quizEvent, _] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEventBase>(pathToEvents), lectureEventId as string, undefined);

	return (
		<>
			{
				(quizEvent == undefined || quizEvent.data.type != 'quiz') &&
				<>
					<TActivityIndicator testID='quiz-event-undefined' />
				</>
			}

			{
				quizEvent != undefined && user.type == "professor" &&
				<>
					<TView testID='lecture-quiz-prof-view'>
						<LectureQuizProfView
							quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>}
							pathToAttempts={pathToAttempts} />
					</TView>

				</>
			}
			{
				quizEvent != undefined && user.type == "student" &&
				<>
					<TView testID='lecture-quiz-student-view'>
						<LectureQuizStudentView
							courseId={courseId}
							lectureId={lectureId}
							lectureEventId={lectureEventId}
							quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>}
							pathToAttempts={pathToAttempts}
						/>
					</TView>

				</>
			}
		</>
	);
};

export const LectureQuizProfView: ReactComponent<{ quizEvent: Document<LectureDisplay.QuizLectureEvent> | undefined, pathToAttempts: string }> = ({ quizEvent, pathToAttempts }) => {


	const studentAttempts = useDocs(CollectionOf<LectureQuizzesAttempts.LectureQuizAttempt>(pathToAttempts));

	const quiz = quizEvent?.data.quizModel

	useEffect(() => {
		if (quiz?.exercise == undefined) {
			return;
		}

	}, [quizEvent]);

	if (quizEvent == undefined || studentAttempts == undefined) {
		return <TActivityIndicator testID='undefined-quiz-loading-prof' />;
	}

	const studentAttemptsData = studentAttempts.map(doc => doc.data);

	return (
		<>
			{(quiz?.showResultToStudents && studentAttempts.length > 0) && <>
				<TView testID='distribution'>
					<SingleDistributionDisplay exercise={quiz.exercise} exerciseAttempts={studentAttemptsData} />

				</TView>
			</>
			}
			{quizEvent != undefined && !quiz?.showResultToStudents && <>
				<TView justifyContent='center' alignItems='center' style={{ height: "100%" }} testID='waiting-view'>
					<TText mb={"md"} size={40} pt={40} bold align='center'>{t('quiz:quiz_display.quiz_live')}</TText>
					<TText mb={"xl"} color='overlay1' align='center'>{t('quiz:quiz_display.waiting_for_answers')}</TText>

					<Hourglass />
				</TView>
			</>
			}
			{quizEvent == undefined && <>
				<TText></TText>
			</>
			}
		</>
	);

};

export const LectureQuizStudentView: ReactComponent<{ courseId: string, lectureId: string, lectureEventId: string, pathToAttempts: string, quizEvent: Document<LectureDisplay.QuizLectureEvent> | undefined }> = ({ courseId, lectureId, lectureEventId, pathToAttempts, quizEvent }) => {

	const { uid } = useAuth();
	const previousAttempt = useDoc(CollectionOf<LectureQuizzesAttempts.LectureQuizAttempt>(pathToAttempts), uid);
	const [studentAnswer, setStudentAnswer] = useState<QuizzesAttempts.Answer | undefined>(undefined);
	const quiz = quizEvent?.data.quizModel
	const exercise = quiz?.exercise;

	useEffect(() => {
		if (quiz == undefined || exercise == undefined)
			return;
		setStudentAnswer(defaultAnswer(exercise));
	}, [quizEvent]);

	const onUpdate = useCallback((newAnswer: number[] | boolean | undefined) => {
		const newFormattedAnswer: LectureQuizzesAttempts.LectureQuizAttempt = exercise?.type == "MCQ" ? { type: "MCQAnswersIndices", value: newAnswer as number[] } : { type: "TFAnswer", value: newAnswer as boolean }
		setStudentAnswer(newFormattedAnswer)
	}, [exercise]);

	if (quizEvent == undefined || quiz == undefined || exercise == undefined) {
		return (<TActivityIndicator testID='undefined-quizEvent-loading' />)
	}

	if (typeof lectureId != 'string') {
		console.log("redirected")
		return <Redirect href={'/'} />;
	}

	async function send() {
		if (studentAnswer == undefined) {
			console.log("Undefined answer, submitted before loading default")
			return;
		}
		sendToLectureEvent(studentAnswer, courseId, lectureId, lectureEventId)
	}

	return (<>
		{
			(quiz.showResultToStudents && previousAttempt != undefined) &&
			<>
				<TView testID='lecture-quiz-result-display-view'>
					<LectureQuizResultDisplay key={quizEvent.id + "result"} studentAnswer={previousAttempt.data} exercise={exercise} result={quiz.answer} testID='quiz-result-display' />
				</TView>
			</>
		}
		{
			!quiz.showResultToStudents &&
			<>
				<TView testID='lecture-quiz-display-view'>
					<LectureQuizDisplay key={quizEvent.id + "display"} studentAnswer={studentAnswer} exercise={exercise} onUpdate={onUpdate} send={send} testID='quiz-display' />
				</TView>
			</>
		}
		{
			quiz.showResultToStudents && previousAttempt == undefined &&
			<>
				<TActivityIndicator testID='no-previous-attempt' />
			</>
		}
	</>

	)

};

export const defaultAnswer = (exercise: Quizzes.Exercise) => {
	if (exercise.type == "MCQ") {
		const MCQAnswer: QuizzesAttempts.MCQAnswersIndices = { type: "MCQAnswersIndices", value: [] }
		return MCQAnswer;
	}
	else {
		const TFAnswer: QuizzesAttempts.TFAnswer = { type: "TFAnswer", value: undefined }
		return TFAnswer;
	}
}

export const LectureQuizDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer | undefined, exercise: Quizzes.Exercise, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, send: () => void, testID: string }> = ({ studentAnswer, exercise, onUpdate, send, testID }) => {
	//if (exercise.type == "MCQ" && studentAnswer != undefined) {
	return (
		<>
			{
				exercise.type == "MCQ" && studentAnswer != undefined &&
				<>
					<TView justifyContent='center' style={{ height: "100%" }}>
						<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"} testID='MCQ'>
							<MCQDisplay
								key={exercise.question + "display"}
								exercise={exercise}
								selectedIds={studentAnswer.value as number[]}
								onUpdate={onUpdate} exId={0}
								disableBottomBar />
							<FancyButton
								onPress={() => {
									send();
								}}
								outlined
								style={{ borderWidth: 0 }}
								icon='save-sharp'
								testID='submit'>
								{t('quiz:quiz_display.submit')}
							</FancyButton>
						</TView>
					</TView>
				</>
			}
			{
				exercise.type == "TF" && studentAnswer != undefined &&
				<>
					<TView justifyContent='center' style={{ height: "100%" }}>
						<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"} testID='TF'>
							<TFDisplay
								key={exercise.question + "display"}
								exercise={exercise}
								selected={studentAnswer.value as boolean | undefined}
								onUpdate={onUpdate} exId={0}
								disableBottomBar />
							<FancyButton
								onPress={() => {
									send();
								}}
								outlined
								style={{ borderWidth: 0 }}
								icon='save-sharp'
								testID='submit'>
								{t('quiz:quiz_display.submit')}
							</FancyButton>
						</TView>
					</TView>
				</>
			}
			{
				studentAnswer == undefined &&
				<>
					<TActivityIndicator />
				</>
			}
		</>
	)

};

export const LectureQuizResultDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer, result: QuizzesAttempts.Answer, exercise: Quizzes.Exercise, testID: string }> = ({ studentAnswer, result, exercise, testID }) => {

	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (

			<TView justifyContent='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"} testID='MCQ'>
					<MCQResultDisplay
						key={exercise.question + "result"}
						exercise={exercise}
						selectedIds={studentAnswer.value as number[]}
						results={result.value as number[]}
						disableBottomBar />

				</TView>
			</TView>
		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (
			<TView justifyContent='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"} testID='TF'>
					<TFResultDisplay
						key={exercise.question + "result"}
						exercise={exercise}
						selected={studentAnswer.value as boolean | undefined}
						result={result.value as boolean}
						disableBottomBar />

				</TView>
			</TView>
		);
	} else {
		return <TActivityIndicator />
	}

};

export async function sendToLectureEvent(studentAnswer: QuizzesAttempts.Answer, courseId: string, lectureId: string, lectureEventId: string) {
	console.log(JSON.stringify(studentAnswer))
	const res = await callFunction(LectureQuizzesAttempts.Functions.createLectureQuizAttempt, {
		courseId: courseId,
		lectureId: lectureId,
		lectureEventId: lectureEventId,
		lectureQuizAttempt: studentAnswer
	});

	if (res.status === 1) {
		console.log(`OKAY, submitted quiz with id ${res.data.id}`);
	} else {
		console.log(`Error while submitting attempt`);
		console.log(res.error)
	}
}