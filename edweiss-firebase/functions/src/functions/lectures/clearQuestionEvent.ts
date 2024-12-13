/**
 * @file clearQuestionEvents.ts
 * @description Cloud function for removing the current question lecture event 
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';


// Types
type Lecture = LectureDisplay.Lecture;

// ------------------------------------------------------------
// -----------     Clear Question Cloud Function      ---------
// ------------------------------------------------------------

export const clearQuestionEvent = onAuthentifiedCall(LectureDisplay.Functions.clearQuestionEvent, async (userId, args) => {
    if (!args.courseId || !args.lectureId) {
        return fail('invalid_arg');
    }

    const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseId}/lectures`), args.lectureId);

    if (lecture == undefined)
        return fail("error_firebase");


    try {
        await lectureRef.update({
            ["event"]: {
                id: "",
                type: "invalid",
            }
        });
    } catch (error) {
        return fail('error_firebase');
    }


    return ok({ id: args.id });
});