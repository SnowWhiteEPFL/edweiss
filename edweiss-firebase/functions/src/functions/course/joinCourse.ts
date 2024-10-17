import { Course_functions } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { fail, ok } from 'utils/status';

export const joinCourse = onAuthentifiedCall(Course_functions.Functions.joinCourse, async (userId, args) => {
	if (!args.course.started) {
		return fail("course_not_started");
	}
	return ok({ message: "course_joined_successfully", course: args.course });
});
