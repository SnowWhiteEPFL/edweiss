/**
 * @file updateCredits.ts
 * @description Cloud function to update the credits of a course
 * @author Florian Dinant
 */


import { Course, Course_functions } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertIsBetween, assertNonEmptyString, assertNumber, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


const MAX_CREDITS = 30;

/**
 * Update the credits of a course
 * @param userId The user ID of the requester
 * @param args courseID: ID of the course to update, credits: new number of credits
 * @returns {} on success, with a fail status on error
 */
export const updateCredits = onAuthentifiedCall(Functions.updateCredits, async (userId, args) => {

    // Validate the input fields
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        credits: Predicate.isBetween(1, MAX_CREDITS),
    });
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNumber(args.credits, "invalid_credits");
    assertIsBetween(args.credits, 1, MAX_CREDITS, "invalid_credits");

    // Fetch the course document and its reference
    const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>(`courses/`), args.courseID);
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
        // Update the course credits
        await courseRef.update({ credits: args.credits });
        return ok({});
    } catch (err) {
        console.error("Error updating course credits:", err);
        return fail("firebase_error");
    }
});
