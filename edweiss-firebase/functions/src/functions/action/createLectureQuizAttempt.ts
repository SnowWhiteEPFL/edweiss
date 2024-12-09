import { LectureQuizzesAttempts } from 'model/quizzes';
import { CustomPredicateQuiz } from 'utils/custom-sanitizer/quiz';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const createLectureQuizAttempt = onSanitizedCall(LectureQuizzesAttempts.Functions.createLectureQuizAttempt, {
	courseId: Predicate.isNonEmptyString,
	lectureId: Predicate.isNonEmptyString,
	lectureEventId: Predicate.isNonEmptyString,
	lectureQuizAttempt: CustomPredicateQuiz.isValidLectureQuizAttempt
}, async (userId, args) => {

	const ref = getDocumentRef(CollectionOf<LectureQuizzesAttempts.LectureQuizAttempt>("courses/" + args.courseId + "/lectures/" + args.lectureId + "/lectureEvents/" + args.lectureEventId + "/attempts"), userId);

	await ref.set(args.lectureQuizAttempt);
	return ok({ id: ref.id });
});