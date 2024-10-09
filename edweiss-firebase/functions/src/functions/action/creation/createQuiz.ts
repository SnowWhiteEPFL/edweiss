import Quizzes from 'model/quizzes';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const createQuiz = onAuthentifiedCall(Quizzes.Functions.creation.createQuiz, async (userId, args) => {
    if (args.quiz.exercises.length == 0)
        return fail("empty_quiz");
    if (args.quiz.name.length == 0)
        return fail("invalid_name");

    const quizCollection = CollectionOf<Quizzes.Quiz>(userId + "/quizzes");

    const res = await quizCollection.add(args.quiz);

    return ok({ id: res.id });
});
