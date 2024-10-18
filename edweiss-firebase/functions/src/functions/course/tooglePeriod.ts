import LectureDisplay from 'model/lectures/lectureDoc';
import { Course_functions } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { ok } from 'utils/status';

type Lecture = LectureDisplay.Lecture;

export const tooglePeriod = onAuthentifiedCall(Course_functions.Functions.tooglePeriod, async (userId, args) => {

	const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseID}/lectures`), args.lectureID);

	await lectureRef.set({
		...lecture,
		availableToStudents: !lecture.availableToStudents
	});
	return ok({ available: lecture.availableToStudents });
}
);