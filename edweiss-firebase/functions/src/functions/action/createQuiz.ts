import Quizzes from 'model/quizzes';
import { Assignment } from 'model/school/courses';
import { CustomPredicateQuiz } from 'utils/custom-sanitizer/quiz';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const createQuiz = onSanitizedCall(Quizzes.Functions.createQuiz, {
	courseId: Predicate.isNonEmptyString,
	quiz: CustomPredicateQuiz.isValidQuiz,
}, async (userId, args) => {
	const thisUser = await getDocument(Collections.users, userId);

	if (thisUser?.type != "professor") {
		return fail("not_authorized");
	}

	const assignmentCollection = CollectionOf<Assignment>("courses/" + args.courseId + "/assignments");
	// "courses/" + args.courseId + "/assignments"
	//         createLectureQuiz: FunctionOf < { lectureQuiz: LectureDisplay.F; courseId: CourseID; path: string }

	const res = await assignmentCollection.add(args.quiz);

	return ok({ id: res.id });
});
