import LectureDisplay from 'model/lectures/lectureDoc';
import Quizzes from 'model/quizzes';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, getDocument, getDocumentAndRef } from 'utils/firestore';
import { Predicate, tag } from 'utils/sanitizer';
import { fail, INVALID_COURSE_ID, ok } from 'utils/status';

export const toggleLectureQuizResult = onSanitizedCall(Quizzes.Functions.toggleLectureQuizResult, {
	courseId: tag(Predicate.isNonEmptyString, INVALID_COURSE_ID),
	lectureEventId: Predicate.isNonEmptyString,
	lectureId: Predicate.isNonEmptyString,
}, async (userId, args) => {

	const thisUser = await getDocument(Collections.users, userId);
	if (thisUser?.type != "professor") {
		return fail("not_authorized");
	}

	const [doc, ref] = await getDocumentAndRef(CollectionOf<LectureDisplay.LectureEvent>("courses/" + args.courseId + "/lectures/" + args.lectureId + "/lectureEvents"), args.lectureEventId);
	if (doc.type == "quiz") {
		doc.quizModel.showResultToStudents = !doc.quizModel.showResultToStudents;
		await ref.set(doc);
		return ok({ id: ref.id });
	}
	else {
		return fail("wrong_ids")
	}

});