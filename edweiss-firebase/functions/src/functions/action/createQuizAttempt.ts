import { QuizzesAttempts } from 'model/quizzes';
import { CustomPredicateQuiz } from 'utils/custom-sanitizer/quiz';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const createQuizAttempt = onSanitizedCall(QuizzesAttempts.Functions.createQuizAttempt, {
	courseId: Predicate.isNonEmptyString,
	path: Predicate.isNonEmptyString,
	quizId: Predicate.isNonEmptyString,
	quizAttempt: CustomPredicateQuiz.isValidQuizAttempt
}, async (userId, args) => {
	const ref = getDocumentRef(CollectionOf<QuizzesAttempts.QuizAttempt>(args.path), userId);

	await ref.set(args.quizAttempt);
	console.log("Document successfully updated!");
	return ok({ id: ref.id });
});
