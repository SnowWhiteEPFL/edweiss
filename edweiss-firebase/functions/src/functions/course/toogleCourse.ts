// import { Course, Course_functions } from 'model/school/courses';
// import { onAuthentifiedCall } from 'utils/firebase';
// import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
// import { fail, ok } from 'utils/status';

import { Course_functions } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { fail } from 'utils/status';


export const toogleCourse = onAuthentifiedCall(Course_functions.Functions.toogleCourse, async (userId, args) => {
	return fail("don't use this.")
	// if (!args.courseID && !userId) {
	// 	return ok({});//fail("empty_course_id");
	// }

	// const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>('courses'), args.courseID);

	// await courseRef.set({
	// 	...course,
	// 	started: !course.started
	// });
	// return ok({});
});