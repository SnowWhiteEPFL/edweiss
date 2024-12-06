import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { clean, CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const updateQuestion = onAuthentifiedCall(LectureDisplay.Functions.likeQuestion, async (userId, args) => {
    if (!args.id || args.id.length == 0)
        return fail("invalid_id");

    const [question, ref] = await getDocumentAndRef(CollectionOf<LectureDisplay.Question>(`courses/${args.courseId}/lectures/${args.lectureId}/questions`), args.id);

    if (question == undefined)
        return fail("error_firebase");

    const updatedQuestion: Partial<LectureDisplay.Question> = {
        anonym: question.anonym,
        likes: args.likes,
        postedTime: question.postedTime,
        text: question.text,
        userID: question.userID,
        username: question.username
    };
    try {
        console.log(updateQuestion);
        await ref.update(clean(updatedQuestion))
    } catch (error) {
        return fail('error_firebase');
    }

    return ok({ id: ref.id });
});