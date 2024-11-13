import { Timestamp } from 'firebase-admin/firestore';
import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { addDocument, CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const createQuestion = onAuthentifiedCall(LectureDisplay.Functions.createQuestion, async (userId, args) => {
    if (!args.courseId || !args.lectureId) {
        return fail('invalid_arg');
    }
    if (args.question.length == 0)
        return fail("empty_question");

    const newQuestion: LectureDisplay.Question = {
        text: args.question,
        userID: userId,
        anonym: false,
        likes: 0,
        postedTime: Timestamp.now()
    }
    const ref = await addDocument(CollectionOf<LectureDisplay.Question>(`users/${args.courseId}/lectures/${args.lectureId}/questions`), newQuestion);

    console.log("Question successfully created!");
    return ok({ id: ref.id });
});


