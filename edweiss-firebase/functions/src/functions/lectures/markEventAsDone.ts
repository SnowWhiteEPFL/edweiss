import LectureDisplay from 'model/lectures/lectureDoc';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument, getDocumentAndRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const markEventAsDone = onSanitizedCall(LectureDisplay.Functions.markEventAsDone, {
    courseId: Predicate.isNonEmptyString,
    lectureId: Predicate.isNonEmptyString,
    id: Predicate.isNonEmptyString,
}, async (userId, args) => {

    const thisUser = await getDocument(Collections.users, userId);
    if (thisUser?.type != "professor") {
        return fail("not_authorized");
    }

    const [doc, ref] = await getDocumentAndRef(CollectionOf<LectureDisplay.QuizLectureEvent>("courses/" + args.courseId + "/lectures/" + args.lectureId + "/lectureEvents"), args.id);
    if (doc.type == "quiz") {
        doc.done = true;
        await ref.set(doc);
        return ok({ id: ref.id });
    }
    else {
        return fail("wrong_ids")
    }

});