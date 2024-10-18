import Quizzes from 'model/quizzes';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const createQuiz = onAuthentifiedCall(Quizzes.Functions.createQuiz, async (userId, args) => {
    if (args.quiz.exercises.length == 0)
        return fail("empty_quiz");
    if (args.quiz.name.length == 0)
        return fail("invalid_name");

    const thisUser = await getDocument(Collections.users, userId);
    if (thisUser?.type != "professor") {
        return fail("not_authorized");
    }
    const quizCollection = CollectionOf<Quizzes.Quiz>("courses/" + args.courseId + "/quizzes");

    const res = await quizCollection.add(args.quiz);

    return ok({ id: res.id });
});
