import Quizzes from 'model/quizzes';
import { CustomPredicateQuiz } from 'utils/custom-sanitizer/quiz';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument } from 'utils/firestore';
import { assertNonEmptyString, assertThat } from 'utils/sanitizer';
import { INVALID_COURSE_ID, fail, ok } from 'utils/status';

export const createQuiz = onAuthentifiedCall(Quizzes.Functions.createQuiz, async (userId, args) => {
	assertNonEmptyString(args.courseId, INVALID_COURSE_ID);
	assertThat(args.quiz, CustomPredicateQuiz.isValidQuiz);

	const thisUser = await getDocument(Collections.users, userId);
	if (thisUser?.type != "professor") {
		return fail("not_authorized");
	}
	const quizCollection = CollectionOf<Quizzes.Quiz>("courses/" + args.courseId + "/quizzes");

	const res = await quizCollection.add(args.quiz);

	return ok({ id: res.id });
});
