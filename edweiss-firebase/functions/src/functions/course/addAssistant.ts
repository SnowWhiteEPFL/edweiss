/**
 * @file addAssistant.ts
 * @description Cloud function to add an assistant in a course
 * @author Florian Dinant
 */


import { Course, Course_functions } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


/**
 * Add an assistant to a course
 * @param userId The user ID of the requester
 * @param args courseID: ID of the course to update, assistantID: ID of the assistant to add
 * @returns {} on success, with a fail status on error
 */
export const addAssistant = onAuthentifiedCall(Functions.addAssistant, async (userId, args) => {

    // Validate the input fields
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        assistantID: Predicate.isNonEmptyString,
    });
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.assistantID, "invalid_assistant");

    // Fetch the course document and its reference
    const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>('courses'), args.courseID);
    if (!course) { return fail("course_not_found"); }

    //------------- Authorization check (ensure the user is authorized to update the material)-------------------
    // Fetch user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

    // Verify the user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) { return fail("not_authorized"); }
    //------------------------------------------------------------------------------------------------------------

    try {

        if (!course.assistants.includes(args.assistantID)) {
            await courseRef.update({ assistants: [...course.assistants, args.assistantID] });
        }

        return ok({});

    } catch (error) {
        console.error("Error adding assistant to Firestore:", error);
        return fail("firebase_error");
    }
});
