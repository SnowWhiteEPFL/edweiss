import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import TSafeArea from '@/components/core/containers/TSafeArea';
import TView from '@/components/core/containers/TView';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import FancyButton from '@/components/input/FancyButton';
import { LectureQuizStudentView } from '@/components/quiz/LectureQuizComponents';
import { MCQDisplay, MCQResultDisplay, TFDisplay, TFResultDisplay } from '@/components/quiz/QuizComponents';
import { callFunction, CollectionOf, Document } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzesAttempts, QuizzesAttempts } from '@/model/quizzes';

export const LectureQuizStudentViewSignature: ApplicationRouteSignature<{
	courseId: string, lectureId: string, lectureEventId: string
	prefetchedQuiz: Document<LectureDisplay.LectureEvent> | undefined
}> = {
	path: "/(app)/quiz/lectureQuizStudentViewPage" as any
}

const LectureQuizStudentViewPage: ApplicationRoute = () => {
	const { courseId, lectureId, lectureEventId, prefetchedQuiz } = useRouteParameters(LectureQuizStudentViewSignature);

	const pathToLectureEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToLectureEvents + "/" + lectureEventId + "/attempts";

	const [quizEvent, _] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEvent>(pathToLectureEvents), lectureEventId, prefetchedQuiz);

	return (<LectureQuizStudentView courseId={courseId} lectureEventId={lectureEventId} lectureId={lectureId} pathToAttempts={pathToAttempts} pathToLectureEvents={pathToLectureEvents} quizEvent={quizEvent} />)

};
export default LectureQuizStudentViewPage;



export const LectureQuizDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer | undefined, exercise: Quizzes.Exercise, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, send: () => void, testId: string }> = ({ studentAnswer, exercise, onUpdate, send, testId }) => {
	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (
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
						//router.back();
					}}
					icon='save-sharp'
					testID='submit'>
					Submit and exit
				</FancyButton>
			</TSafeArea>
		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (
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
						//router.back();
					}}
					icon='save-sharp'
					testID='submit'>
					Submit and exit
				</FancyButton>
			</TSafeArea >
		);
	} else {
		return <TActivityIndicator />
	}
};

export const LectureQuizResultDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer, result: QuizzesAttempts.Answer, exercise: Quizzes.Exercise, testId: string }> = ({ studentAnswer, result, exercise, testId }) => {

	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (
			<TSafeArea>
				<TView>
					<MCQResultDisplay key={exercise.question + "result"} exercise={exercise} selectedIds={studentAnswer.value as number[]} results={result.value as number[]} />

				</TView >
			</TSafeArea>
		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (
			<TSafeArea>
				<TView>
					<TFResultDisplay key={exercise.question + "result"} exercise={exercise} selected={studentAnswer.value as boolean | undefined} result={result.value as boolean} />

				</TView>
			</TSafeArea>
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
