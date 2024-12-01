/**
 * @file updateCourse.ts
 * @description Cloud function to update course information
 * @author Florian Dinant
 */


import { Course, Course_functions, UpdateCourseArgs } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { assertIsBetween, assertNonEmptyString, assertNumber, assertString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;

const MAX_NAME_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 100;
const MAX_CREDITS = 30;

/**
 * Update course information
 * @param userId The user ID of the requester
 * @param args courseID: ID of the course to update, courseJSON: new course information
 * @returns {} on success, with a fail status on error
 */
export const updateCourse = onSanitizedCall(Functions.updateCourse, {
    courseID: Predicate.isNonEmptyString,
    courseJSON: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.courseJSON, "invalid_course");

    // Parse the course JSON
    let courseData: UpdateCourseArgs;
    courseData = JSON.parse(args.courseJSON);
    assertThatFields(courseData, {
        name: Predicate.isBetweenLength(1, MAX_NAME_LENGTH),
        description: Predicate.isBetweenLength(0, MAX_DESCRIPTION_LENGTH),
        credits: Predicate.isBetween(0, MAX_CREDITS),
        section: Predicate.isString,
    });
    assertNonEmptyString(courseData.name, "invalid_name");
    assertString(courseData.description, "invalid_description");
    assertNumber(courseData.credits, "invalid_credits");
    assertIsBetween(courseData.name.length, 0, MAX_NAME_LENGTH, "name_too_long");
    assertIsBetween(courseData.description.length, 0, MAX_DESCRIPTION_LENGTH, "description_too_long");
    assertNonEmptyString(courseData.section, "invalid_section");
    assertIsBetween(courseData.credits, 0, MAX_CREDITS, "credits_out_of_range");

    // Fetch the course document and its reference
    const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>(`courses/`), args.courseID);
    if (!course) return fail("course_not_found");

    //-------------------------------------------------------------------------------------------------
    // Fetch the user data
    const user = await getRequiredDocument<AppUser>(CollectionOf<AppUser>('users'), userId, { error: "user_not_found", status: 0 });

    // Verify user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) {
        return fail("not_authorized");
    }
    //-------------------------------------------------------------------------------------------------

    try {
        // Update the course credits
        await courseRef.update({ name: courseData.name, description: courseData.description, credits: courseData.credits, section: courseData.section });
        return ok({});
    } catch (err) {
        console.error("Error updating course credits:", err);
        return fail("firebase_error");
    }
});
