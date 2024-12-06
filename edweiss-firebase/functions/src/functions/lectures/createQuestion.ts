import { Timestamp } from 'firebase-admin/firestore';
import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { addDocument, CollectionOf, Collections, getRequiredDocument } from 'utils/firestore';
import { fail, ok } from 'utils/status';


export const createQuestion = onAuthentifiedCall(LectureDisplay.Functions.createQuestion, async (userId, args) => {
    const user = await getRequiredDocument(Collections.users, userId, fail('user_not_found'));

    if (!user.courses.includes(args.courseId))
        return fail('not_in_course');

    if (!args.courseId || !args.lectureId) {
        return fail('invalid_arg');
    }
    if (args.question.length == 0)
        return fail("empty_question");

    const newQuestion: LectureDisplay.Question = {
        text: args.question,
        userID: userId,
        username: user.name,
        anonym: args.anonym,
        likes: 0,
        postedTime: Timestamp.now()
    }
    const ref = await addDocument(CollectionOf<LectureDisplay.Question>(`courses/${args.courseId}/lectures/${args.lectureId}/questions`), newQuestion);

    console.log("Question successfully created!");
    return ok({ id: ref.id });
});


