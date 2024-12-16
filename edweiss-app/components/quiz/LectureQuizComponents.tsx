import { LectureQuizDisplay, LectureQuizResultDisplay, sendToLectureEvent } from '@/app/(app)/quiz/lectureQuizStudentView';
import { SingleDistributionDisplay } from '@/app/(app)/quiz/temporaryQuizProfView';
import { CollectionOf, Document } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { useDoc, useDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { LectureQuizzesAttempts, QuizzesAttempts } from '@/model/quizzes';
import { Redirect } from 'expo-router';
import { t } from 'i18next';
import React, { useCallback, useEffect, useState } from 'react';
import Hourglass from '../animations/Hourglass';
import TView from '../core/containers/TView';
import TActivityIndicator from '../core/TActivityIndicator';
import TText from '../core/TText';

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
					<TActivityIndicator />
				</>
			}

			{
				user.type == "professor" &&
				<>
					<LectureQuizProfView courseId={courseId} lectureId={lectureId} lectureEventId={lectureEventId} quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>} pathToAttempts={pathToAttempts} />
				</>
			}
			{
				user.type == "student" &&
				<>
					<LectureQuizStudentView courseId={courseId} lectureId={lectureId} lectureEventId={lectureEventId} quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>} pathToAttempts={pathToAttempts} pathToLectureEvents={pathToEvents} />
				</>
			}
		</>
	);
};

export const LectureQuizProfView: ReactComponent<{ courseId: string, lectureId: string, lectureEventId: string, quizEvent: Document<LectureDisplay.QuizLectureEvent> | undefined, pathToAttempts: string }> = ({ courseId, lectureId, lectureEventId, quizEvent, pathToAttempts }) => {


	const studentAttempts = useDocs(CollectionOf<LectureQuizzesAttempts.LectureQuizAttempt>(pathToAttempts));

	const quiz = quizEvent?.data.quizModel

	useEffect(() => {
		if (quiz?.exercise == undefined) {
			return;
		}
		// else if (quizEvent?.data.done) {
		// 	router.back();
		// }
	}, [quizEvent]);

	// ------------The following must be managed in the remote control-----------

	// async function toggleResult() {
	// 	setLoading(true);
	// 	const res = await callFunction(Quizzes.Functions.toggleLectureQuizResult, { lectureId: lectureId, lectureEventId: lectureEventId, courseId: courseId, });

	// 	if (res.status === 1) {
	// 		console.log(`toggled showResultToStudent boolean`);
	// 	} else {
	// 		console.log(`Error while toggling boolean shoresultToStudent`);
	// 	}
	// 	setLoading(false);
	// }

	// --------------------------
	if (quizEvent == undefined || studentAttempts == undefined) {
		return <TActivityIndicator testID='undefined-quiz-loading-prof' />;
	}

	const studentAttemptsData = studentAttempts.map(doc => doc.data);


	return (
		<>
			{/* <TSafeArea> */}

			{(quiz?.showResultToStudents && studentAttempts.length > 0) && <>
				{/* <TView mb='lg'> */}
				{/* <RichText>{`
					Hello you,


					Hello me
					`}</RichText> */}

				<SingleDistributionDisplay exercise={quiz.exercise} exerciseAttempts={studentAttemptsData} />
				{/* </TView> */}
			</>
			}
			{quizEvent != undefined && !quiz?.showResultToStudents && <>
				<TView justifyContent='center' alignItems='center' style={{ height: "100%" }}>
					<TText mb={"md"} size={40} pt={40} bold align='center'>Quiz is live!</TText>
					<TText mb={"xl"} color='overlay1' align='center'>{t('quiz:quiz_display.waiting_for_answers')}</TText>

					<Hourglass />
				</TView>
			</>
			}
			{/* ------- must be put in the remote control ------- */}
			{/* <FancyButton loading={loading} onPress={toggleResult}>
					{quiz?.showResultToStudents ? "Show quiz to students" : "Show results to students"}
				</FancyButton> */}
			{/* </TSafeArea> */}

		</>
	);

};

export const LectureQuizStudentView: ReactComponent<{ courseId: string, lectureId: string, lectureEventId: string, pathToLectureEvents: string, pathToAttempts: string, quizEvent: Document<LectureDisplay.QuizLectureEvent> | undefined }> = ({ courseId, lectureId, lectureEventId, pathToLectureEvents, pathToAttempts, quizEvent }) => {

	const { uid } = useAuth();
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

	if (quiz.showResultToStudents && previousAttempt != undefined) {
		return <LectureQuizResultDisplay key={quizEvent.id + "result"} studentAnswer={previousAttempt.data} exercise={exercise} result={quiz.answer} testId='quiz-result-display' />;
	}
	else if (!quiz.showResultToStudents) {
		return <LectureQuizDisplay key={quizEvent.id + "display"} studentAnswer={studentAnswer} exercise={exercise} onUpdate={onUpdate} send={send} testId='quiz-display' />;
	}
	else {
		return (<TActivityIndicator />);
	}
};