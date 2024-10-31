import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const createQuestion = onAuthentifiedCall(LectureDisplay.Functions.createQuestion, async (userId, args) => {
    if (!args.courseId || !args.lectureId) {
        return fail('invalid_arg');
    }
    if (args.question.text.length == 0)
        return fail("empty_question");

    const [lecture, ref] = await getDocumentAndRef(CollectionOf<LectureDisplay.Lecture>(`users/${args.courseId}/lectures`), args.lectureId);

    if (lecture == undefined)
        return fail("error_firebase");

    const updatedQuestions = [...lecture.questions, args.question];
    try {
        await ref.update({ [`questions`]: updatedQuestions });
    } catch (error) {
        return fail('error_firebase');
    }

    console.log("Question successfully updated!");
    return ok({ id: ref.id });
});


