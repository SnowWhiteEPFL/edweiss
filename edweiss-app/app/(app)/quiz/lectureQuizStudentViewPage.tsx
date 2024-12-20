import { ApplicationRoute } from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import { LectureQuizStudentView } from '@/components/quiz/LectureQuizComponents';
import { CollectionOf, Document } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import LectureDisplay from '@/model/lectures/lectureDoc';

export const LectureQuizStudentViewSignature: ApplicationRouteSignature<{
	courseId: string, lectureId: string, lectureEventId: string
	prefetchedQuiz: Document<LectureDisplay.QuizLectureEvent> | undefined
}> = {
	path: "/(app)/quiz/lectureQuizStudentViewPage"
}

const LectureQuizStudentViewPage: ApplicationRoute = () => {
	const { courseId, lectureId, lectureEventId, prefetchedQuiz } = useRouteParameters(LectureQuizStudentViewSignature);

	const pathToLectureEvents = "courses/" + courseId + "/lectures/" + lectureId + "/lectureEvents"
	const pathToAttempts = pathToLectureEvents + "/" + lectureEventId + "/attempts";


	const [quizEvent, _] = usePrefetchedDynamicDoc(CollectionOf<LectureDisplay.LectureEventBase>(pathToLectureEvents), lectureEventId, prefetchedQuiz);

	return (<TView testID='lecture-quiz-student-view-view'>
		<LectureQuizStudentView courseId={courseId} lectureEventId={lectureEventId} lectureId={lectureId} pathToAttempts={pathToAttempts} quizEvent={quizEvent as Document<LectureDisplay.QuizLectureEvent>} />
	</TView>)

};
export default LectureQuizStudentViewPage;




