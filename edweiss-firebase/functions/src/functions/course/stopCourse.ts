import { Course_functions } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { ok } from 'utils/status';


export const stopCourse = onAuthentifiedCall(Course_functions.Functions.startCourse, async (userId, args) => {
	await CollectionOf('courses').doc(args.courseID).update({ started: false });
	return ok({});
}
);