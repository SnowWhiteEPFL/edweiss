import Quizzes from 'model/quizzes';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { ok } from 'utils/status';

export const updateQuiz = onAuthentifiedCall(Quizzes.Functions.updateQuiz, async (userId, args) => {
	//const thisUser = await getDocument(Collections.users, userId);
	// if (thisUser?.type != "professor") {
	// 	return fail("not_authorized");
	// }
	const id = "TestQuizId";
	const ref = getDocumentRef(CollectionOf<Quizzes.Quiz>("courses/" + args.courseId + "/quizzes"), id);
	await ref.set(args.quiz);
	console.log("Updtaed quiz");
	return ok({ id: ref.id });

});