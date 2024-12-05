/**
 * @file updateDescription.ts
 * @description Cloud function to update the description of a course
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


const MAX_DESCRIPTION_LENGTH = 500;


/**
 * Update the description of a course.
 * @param userId ID of the user calling the function
 * @param args courseID: ID of the course to update, description: new description for the course
 * @returns {} on success, with a fail status on error
 */
export const updateDescription = onAuthentifiedCall(Functions.updateDescription, async (userId, args) => {

    // Validate input arguments
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        description: Predicate.isString,
    })
    assertNonEmptyString(args.courseID, "invalid_userid");
    assertNonEmptyString(args.description, "invalid_description");

    if (args.description.length > MAX_DESCRIPTION_LENGTH) {
        return fail("description_too_long");
    }

    // Fetch the course data and its reference
    const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>('courses'), args.courseID);
    if (!course) return fail("course_not_found");

    //-------------------------------------------------------------------------------------------------
    // Fetch the user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

    // Verify user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) {
        return fail("not_authorized");
    }
    //-------------------------------------------------------------------------------------------------

    try {
        // Update the course description
        await courseRef.update({ description: args.description });
        return ok({});
    } catch (err) {
        console.error("Error updating course description:", err);
        return fail("firebase_error");
    }
});
