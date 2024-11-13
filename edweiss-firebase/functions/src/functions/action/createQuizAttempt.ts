import { QuizzesAttempts } from 'model/quizzes';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { Predicate, assertNonEmptyString, assertThatFields } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const createQuizAttempt = onAuthentifiedCall(QuizzesAttempts.Functions.createQuizAttempt, async (userId, args) => {
	assertNonEmptyString(args.courseId);
	assertNonEmptyString(args.path);
	assertNonEmptyString(args.quizId);
	assertThatFields(args.quizAttempt, {
		attempts: Predicate.isPositive,
		answers: [Predicate.isNonEmptyArray, Predicate.forEach(
			Predicate.dispatch("type", {
				MCQAnswersIndices: Predicate.fields({
					type: Predicate.is("MCQAnswersIndices"),
					value: Predicate.forEach(Predicate.isNumber)
				}),
				TFAnswer: Predicate.fields({
					type: Predicate.is("TFAnswer"),
					value: Predicate.isOptionalBoolean
				})
			})
		)]
	})

	const ref = getDocumentRef(CollectionOf<QuizzesAttempts.QuizAttempt>(args.path), userId);

	await ref.set(args.quizAttempt);
	console.log("Document successfully updated!");
	return ok({ id: ref.id });
});
