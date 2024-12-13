import { Timestamp } from 'firebase-admin/firestore';
import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, OK } from 'utils/status';

export const likeQuestion = onAuthentifiedCall(LectureDisplay.Functions.likeQuestion, async (userId, args) => {
    if (!args.id || args.id.length == 0)
        return fail("invalid_id");

    const [question, questionRef] = await getDocumentAndRef(CollectionOf<LectureDisplay.Question>(`courses/${args.courseId}/lectures/${args.lectureId}/questions`), args.id);
    const [like, likeRef] = await getDocumentAndRef(CollectionOf<LectureDisplay.Like>(`courses/${args.courseId}/lectures/${args.lectureId}/questions/${args.id}/likes`), userId);

    if (args.liked) {
        if (like != undefined)
            return OK;

        await likeRef.set({
            createdAt: Timestamp.now()
        });

        await questionRef.set({
            ...question,
            likes: question.likes + 1
        });
      
        return OK;
    } else {
        if (like == undefined)
            return OK;

        await likeRef.delete();

        await questionRef.set({
            ...question,
            likes: Math.max(question.likes - 1, 0)
        });

        return OK;
    }
});
