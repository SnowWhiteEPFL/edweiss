/**
 * @file removeAssignment.ts
 * @description Cloud function to remove an assignment from a course
 * @author Florian Dinant
 */


import { Assignment, Course, Course_functions } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;



export const removeAssignment = onSanitizedCall(Functions.removeAssignment, {
    courseID: Predicate.isNonEmptyString,
    assignmentID: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.assignmentID, "invalid_id");

    //-------------------------------------------------------------------------------------------------
    // Fetch the course data
    const course = await getDocument<Course>(CollectionOf<Course>('courses'), args.courseID);
    if (!course) return fail("course_not_found");

    // Fetch the user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

    // Verify user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) {
        return fail("not_authorized");
    }
    //-------------------------------------------------------------------------------------------------

    try {
        const [assignment, assignmentRef] = await getDocumentAndRef(CollectionOf<Assignment>(`courses/${args.courseID}/assignments/`), args.assignmentID);

        if (!assignment) { return fail("firebase_error"); }

        await assignmentRef.delete();

        return ok({});
    } catch (err) {
        console.error("Error removing assignment:", err);
        return fail("firebase_error");
    }
});
