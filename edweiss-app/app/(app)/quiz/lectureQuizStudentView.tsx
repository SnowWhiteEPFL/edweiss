import ReactComponent, { ApplicationRoute } from '@/constants/Component';

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
	prefetchedQuiz: Document<LectureDisplay.QuizLectureEvent> | undefined
}> = {
	path: "/(app)/quiz/lectureQuizStudentView"
}

const lectureQuizStudentViewPage: ApplicationRoute = () => {
	const { courseId, lectureId, lectureEventId, prefetchedQuiz } = useRouteParameters(LectureQuizStudentViewSignature);

	const pathToLectureEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToLectureEvents + "/" + lectureEventId + "/attempts";


	const [quizEvent, _] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEventBase>(pathToLectureEvents), lectureEventId, prefetchedQuiz);

	return (<LectureQuizStudentView courseId={courseId} lectureEventId={lectureEventId} lectureId={lectureId} pathToAttempts={pathToAttempts} pathToLectureEvents={pathToLectureEvents} quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>} />)

};
export default lectureQuizStudentViewPage;



export const LectureQuizDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer | undefined, exercise: Quizzes.Exercise, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, send: () => void, testId: string }> = ({ studentAnswer, exercise, onUpdate, send, testId }) => {
	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (
			<TView justifyContent='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"}>
					<MCQDisplay key={exercise.question + "display"} exercise={exercise} selectedIds={studentAnswer.value as number[]} onUpdate={onUpdate} exId={0} disableBottomBar />
					<FancyButton
						onPress={() => {
							if (send != undefined) {
								send();
							}
							//router.back();
						}}
						outlined
						style={{ borderWidth: 0 }}
						icon='save-sharp'
						testID='submit'>
						Submit
					</FancyButton>
				</TView>
			</TView>

		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (

			<TView justifyContent='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"}>
					<TFDisplay key={exercise.question + "display"} exercise={exercise} selected={studentAnswer.value as boolean | undefined} onUpdate={onUpdate} exId={0} disableBottomBar />
					<FancyButton
						onPress={() => {
							if (send != undefined) {
								send();
							}
							//router.back();
						}}
						outlined
						style={{ borderWidth: 0 }}
						icon='save-sharp'
						testID='submit'>
						Submit
					</FancyButton>
				</TView>
			</TView>

		);
	} else {
		return <TActivityIndicator />
	}
};

export const LectureQuizResultDisplay: ReactComponent<{ studentAnswer: QuizzesAttempts.Answer, result: QuizzesAttempts.Answer, exercise: Quizzes.Exercise, testId: string }> = ({ studentAnswer, result, exercise, testId }) => {

	if (exercise.type == "MCQ" && studentAnswer != undefined) {
		return (

			<TView justifyContent='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"}>
					<MCQResultDisplay key={exercise.question + "result"} exercise={exercise} selectedIds={studentAnswer.value as number[]} results={result.value as number[]} disableBottomBar />

				</TView>
			</TView>
		);
	}
	else if (exercise.type == "TF" && studentAnswer != undefined) { // if type == "TF"
		return (
			<TView justifyContent='center' style={{ height: "100%" }}>
				<TView backgroundColor="base" radius='lg' mx={'md'} p={"md"}>
					<TFResultDisplay key={exercise.question + "result"} exercise={exercise} selected={studentAnswer.value as boolean | undefined} result={result.value as boolean} disableBottomBar />

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
