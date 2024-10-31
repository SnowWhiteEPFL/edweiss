import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const updateQuestion = onAuthentifiedCall(LectureDisplay.Functions.updateQuestion, async (userId, args) => {
    if (!args.id)
        return fail("invalid_id");

    const [lecture, ref] = await getDocumentAndRef(CollectionOf<LectureDisplay.Lecture>(`users/${userId}/lectures/`), args.id);

    if (lecture == undefined)
        return fail("error_firebase");

    const updatedFields: Partial<LectureDisplay.Lecture> = {};
    updatedFields.questions = []
    if (args.question) updatedFields.questions[0] = args.question as LectureDisplay.Question;


    const updatedQuestions = [...lecture.questions, updatedFields.questions]
    try {
        await ref.update({ [`questions`]: updatedQuestions });
    } catch (error) {
        return fail('error_firebase');
    }

    return ok({});
});