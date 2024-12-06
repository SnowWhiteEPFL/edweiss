import LectureDisplay from 'model/lectures/lectureDoc';
import Quizzes from 'model/quizzes';
import { CustomPredicateQuiz } from 'utils/custom-sanitizer/quiz';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const createLectureQuiz = onSanitizedCall(Quizzes.Functions.createLectureQuiz, {
	courseId: Predicate.isNonEmptyString,
	lectureQuiz: CustomPredicateQuiz.isValidLectureQuizEvent, // quiz should be a QuizLectureEvent
	lectureId: Predicate.isNonEmptyString,
}, async (userId, args) => {
	console.log("inside create lecture quiz")
	const thisUser = await getDocument(Collections.users, userId);

	if (thisUser?.type != "professor") {
		return fail("not_authorized");
	}

	const assignmentCollection = CollectionOf<LectureDisplay.LectureEvent>("courses/" + args.courseId + "/lectures/" + args.lectureId);
	// "courses/" + args.courseId + "/assignments"
	//         createLectureQuiz: FunctionOf < { lectureQuiz: LectureDisplay.F; courseId: CourseID; path: string }

	const res = await assignmentCollection.add(args.lectureQuiz);

	return ok({ id: res.id });
});
