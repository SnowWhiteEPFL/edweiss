import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import TSafeArea from '@/components/core/containers/TSafeArea';
import TView from '@/components/core/containers/TView';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import FancyButton from '@/components/input/FancyButton';
import { MCQDisplay, MCQResultDisplay, TFDisplay, TFResultDisplay } from '@/components/quiz/QuizComponents';
import { callFunction, CollectionOf, Document } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDoc, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzesAttempts, QuizzesAttempts } from '@/model/quizzes';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

export const LectureQuizStudentViewSignature: ApplicationRouteSignature<{
	quizId: string, courseId: string, lectureId: string,
	prefetchedQuiz: Document<LectureDisplay.LectureEvent> | undefined
}> = {
	path: "/(app)/quiz/quizStudentView" as any
}

const LectureQuizStudentView: ApplicationRoute = () => {

	// pushWithParameters(LectureQuizStudentViewSignature, {

	// })

	const { quizId, courseId, lectureId, prefetchedQuiz } = useRouteParameters(LectureQuizStudentViewSignature);
	const pathToLectureEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToLectureEvents + "/" + quizId + "/attempts";
	const { uid } = useAuth();
	const [quizEvent] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEvent>(pathToLectureEvents), quizId, prefetchedQuiz);
	const previousAttempt = useDoc(CollectionOf<LectureQuizzesAttempts.LectureQuizAttempt>(pathToAttempts), uid);
	const [studentAnswer, setStudentAnswer] = useState<QuizzesAttempts.Answer | undefined>(undefined);
	const quiz = quizEvent?.data.quizModel
	const exercise = quiz?.exercise;



	useEffect(() => {

		if (quiz == undefined || exercise == undefined)
			return;

		const defaultAnswer = () => {
			if (exercise.type == "MCQ") {
				const MCQAnswer: QuizzesAttempts.MCQAnswersIndices = { type: "MCQAnswersIndices", value: [] }
				return MCQAnswer;
			}
			else {
				const TFAnswer: QuizzesAttempts.TFAnswer = { type: "TFAnswer", value: undefined }
				return TFAnswer;
			}
		}

		setStudentAnswer(defaultAnswer());
	}, [quizEvent]);



	const onUpdate = useCallback((newAnswer: number[] | boolean | undefined) => {
		const newFormattedAnswer: LectureQuizzesAttempts.LectureQuizAttempt = exercise?.type == "MCQ" ? { type: "MCQAnswersIndices", value: newAnswer as number[] } : { type: "TFAnswer", value: newAnswer as boolean }
		setStudentAnswer(newFormattedAnswer)
	}, []);

	if (quizEvent == undefined || quiz == undefined || exercise == undefined) {
		return (<TActivityIndicator testID='undefined-quizEvent-loading' />)
	}

	if (typeof quizId != 'string') {
		return <Redirect href={'/'} />;
	}


	async function send() {
		//sendToLectureEvent()
	}

	if (quiz.showResultToStudents && previousAttempt != undefined) {
		return <LectureQuizResultDisplay key={quizEvent.id + "result"} studentAnswer={previousAttempt.data} exercise={exercise} result={quiz.answer} testId='quiz-result-display'></LectureQuizResultDisplay>;
	}
	else if (!quiz.showResultToStudents) {
		return <LectureQuizDisplay key={quizEvent.id + "display"} studentAnswer={studentAnswer} exercise={exercise} onUpdate={onUpdate} send={send} testId='quiz-display'></LectureQuizDisplay>;
	}
	else {
		return (<TActivityIndicator />);
	}

};

export default LectureQuizStudentView;

export const LectureQuizDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer | undefined, exercise: Quizzes.Exercise, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, send: () => void, testId: string }> = ({ studentAnswer, exercise, onUpdate, send, testId }) => {
	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (
			<>
				<TSafeArea>
					<TView>
						<MCQDisplay key={exercise.question + "display"} exercise={exercise} selectedIds={studentAnswer.value as number[]} onUpdate={onUpdate} exId={0} />
					</TView >
					<FancyButton
						mt={"md"} mb={"md"}
						onPress={() => {
							if (send != undefined) {
								send();
							}
							router.back();
						}}
						icon='save-sharp'
						testID='submit'>
						Submit and exit
					</FancyButton>
				</TSafeArea>
			</>
		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (
			<>
				<TSafeArea>
					<TView>
						<TFDisplay key={exercise.question + "display"} exercise={exercise} selected={studentAnswer.value as boolean | undefined} onUpdate={onUpdate} exId={0} />
					</TView >
					<FancyButton
						mt={"md"} mb={"md"}
						onPress={() => {
							if (send != undefined) {
								send();
							}
							router.back();
						}}
						icon='save-sharp'
						testID='submit'>
						Submit and exit
					</FancyButton>
				</TSafeArea >
			</>
		);
	} else {
		return <TActivityIndicator />
	}
};

export const LectureQuizResultDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer, result: QuizzesAttempts.Answer, exercise: Quizzes.Exercise, testId: string }> = ({ studentAnswer, result, exercise, testId }) => {

	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (
			<>
				<TSafeArea>
					<TView>
						<MCQResultDisplay key={exercise.question + "result"} exercise={exercise} selectedIds={studentAnswer.value as number[]} results={result.value as number[]} />);
						<FancyButton
							mt={"md"} mb={"md"}
							onPress={() => {
								router.back();
							}}
							testID='exit-result'>
							Exit
						</FancyButton>
					</TView >
				</TSafeArea>
			</>
		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (
			<>
				<TSafeArea>
					<TView>
						return (<TFResultDisplay key={exercise.question + "result"} exercise={exercise} selected={studentAnswer.value as boolean | undefined} result={result.value as boolean} />);
						<FancyButton
							mt={"md"} mb={"md"}
							onPress={() => {
								router.back();
							}}
							testID='exit-result'>
							Exit
						</FancyButton>
					</TView >
				</TSafeArea >
			</>
		);
	} else {
		return <TActivityIndicator />
	}

};

export async function sendToLectureEvent(studentAnswer: QuizzesAttempts.Answer, courseId: string, lectureId: string, lectureEventId: string, quizId: string) {
	const res = await callFunction(LectureQuizzesAttempts.Functions.createLectureQuizAttempt, {
		courseId: courseId,
		quizId: quizId,
		lectureId: lectureId,
		lectureEventId: lectureEventId,
		lectureQuizAttempt: studentAnswer
	});

	if (res.status === 1) {
		console.log(`OKAY, submitted quiz with id ${res.data.id}`);
	} else {
		console.log(`Error while submitting attempt`);
	}
}
