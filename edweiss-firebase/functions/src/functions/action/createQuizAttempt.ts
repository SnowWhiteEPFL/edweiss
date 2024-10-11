import { QuizzesAttempts } from 'model/quizzes';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const createQuizAttempt = onAuthentifiedCall(QuizzesAttempts.Functions.createQuizAttempt, async (userId, args) => {
	if (userId == undefined)
		return fail("empty_quiz");

	const ref = getDocumentRef(CollectionOf<QuizzesAttempts.QuizAttempt>("courses/" + args.courseId + "/quizzes/" + args.quizId + "/attempts"), userId);

	await ref.set(args.quizAttempt);
	console.log("Document successfully updated!");
	return ok({ id: ref.id });
});
