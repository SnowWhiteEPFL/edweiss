/**
 * @file updateName.ts
 * @description Cloud function to update the name of a course.
 * 
 * @author Florian Dinant
 */

import { Course, Course_functions } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


const MAX_NAME_LENGTH = 40;


/**
 * Update the name of a course.
 * @param userId ID of the user calling the function
 * @param args courseID: ID of the course to update, name: new name for the course
 * @returns {} on success, with a fail status on error
 */
export const updateName = onAuthentifiedCall(Functions.updateName, async (userId, args) => {

    // Validate input arguments
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        name: Predicate.isNonEmptyString,
    })
    assertNonEmptyString(args.courseID, "invalid_userid");
    assertNonEmptyString(args.name, "invalid_name");

    // Fetch the course data and its reference
    const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>(`courses/`), args.courseID);
    if (!course) return fail("firebase_error");

    //-------------------------------------------------------------------------------------------------
    // Fetch the user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

    // Verify user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) {
        return fail("not_authorized");
    }
    //-------------------------------------------------------------------------------------------------

    // Validate the new course name length
    if (args.name.length > MAX_NAME_LENGTH) return fail("name_too_long");

    try {
        await courseRef.update({ name: args.name });
        return ok({});
    } catch (err) {
        console.error("Error updating course name:", err);
        return fail("firebase_error");
    }
});
