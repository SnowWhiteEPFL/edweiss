/**
 * @file broadcastQuizz.ts
 * @description Cloud function for adding quiz as current lecture event 
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import LectureDisplay from 'model/lectures/lectureDoc';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument, getDocumentAndRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';


// Types
type Lecture = LectureDisplay.Lecture;

// ------------------------------------------------------------
// -----------   Broadcast Question Cloud Function    ---------
// ------------------------------------------------------------

export const broadcastQuiz = onSanitizedCall(LectureDisplay.Functions.broadcastQuiz, {
    courseId: Predicate.isNonEmptyString,
    lectureId: Predicate.isNonEmptyString,
    id: Predicate.isNonEmptyString,
}, async (userId, args) => {

    const thisUser = await getDocument(Collections.users, userId);
    if (thisUser?.type != "professor") {
        return fail("not_authorized");
    }


    const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseId}/lectures`), args.lectureId);

    if (lecture == undefined)
        return fail("error_firebase");


    try {
        await lectureRef.update({
            ["event"]: {
                id: args.id,
                type: "quiz",
            }
        });
    } catch (error) {
        return fail('error_firebase');
    }


    return ok({ id: args.id });
});