import Quizzes from 'model/quizzes';
import { CustomPredicateQuiz } from 'utils/custom-sanitizer/quiz';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { Predicate, assertNonEmptyString, assertThat, tag } from 'utils/sanitizer';
import { INVALID_COURSE_ID, ok } from 'utils/status';

export const updateQuiz = onSanitizedCall(Quizzes.Functions.updateQuiz, {
	courseId: tag(Predicate.isNonEmptyString, INVALID_COURSE_ID),
	quiz: CustomPredicateQuiz.isValidQuiz,
	path: Predicate.isNonEmptyString
}, async (userId, args) => {
	//const thisUser = await getDocument(Collections.users, userId);
	// if (thisUser?.type != "professor") {
	// 	return fail("not_authorized");
	// }

	assertNonEmptyString(args.courseId, INVALID_COURSE_ID);
	assertThat(args.quiz, CustomPredicateQuiz.isValidQuiz);

	const id = "TestQuizId";
	const ref = getDocumentRef(CollectionOf<Quizzes.Quiz>("courses/" + args.courseId + "/quizzes"), id);
	await ref.set(args.quiz);
	console.log("Updtaed quiz");
	return ok({ id: ref.id });

});