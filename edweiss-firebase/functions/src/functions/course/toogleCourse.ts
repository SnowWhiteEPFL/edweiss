import { Course, Course_functions } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { ok } from 'utils/status';


export const toogleCourse = onAuthentifiedCall(Course_functions.Functions.toogleCourse, async (userId, args) => {
	if (!args.courseID && !userId) {
		return ok({});//fail("empty_course_id");
	}

	const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>('courses'), args.courseID);

	await courseRef.set({
		...course,
		started: !course.started
	});
	return ok({});
}
);