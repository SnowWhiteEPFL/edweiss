/**
 * @file updateSection.ts
 * @description Cloud function to update the section of a course
 * @author Florian Dinant
 */


import { Course, Course_functions, Section } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertIsIn, assertNonEmptyString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


const validTypes: Section[] = ["IN", "SC", "MA", "PH", "CGC", "EL", "GM", "MT", "MX", "SV", "AR", "GC", "SIE"];

/**
 * Update the section of a course.
 * @param userId ID of the user calling the function
 * @param args courseID: ID of the course to update, section: new section for the course
 * @returns {} on success, with a fail status on error
 */
export const updateSection = onAuthentifiedCall(Functions.updateSection, async (userId, args) => {

    // Validate the input fields
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        section: Predicate.isIn<string>(validTypes),
    });
    assertNonEmptyString(args.courseID, "invalid_id");
    assertIsIn(args.section, validTypes, "invalid_arg");

    // Fetch the course data
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
        // Update the course section
        await courseRef.update({ section: args.section });
        return ok({});
    } catch (err) {
        console.error("Error updating course section:", err);
        return fail("firebase_error");
    }
});
