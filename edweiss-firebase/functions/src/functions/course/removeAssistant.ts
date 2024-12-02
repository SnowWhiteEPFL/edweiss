/**
 * @file removeAssistant.ts
 * @description Cloud function to remove an assistant from a course
 * @author Florian Dinant
 */


import { Course, Course_functions } from 'model/school/courses';
import { AppUser, StudentID } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { assertNonEmptyString, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


/**
 * Removes an assistant from a course.
 * @param userId ID of the authenticated user invoking the function.
 * @param args Contains `courseID` and `assistantID` with the assistant to be removed.
 * @returns {} on success, with a fail status on error.
 */
export const removeAssistant = onSanitizedCall(Functions.removeAssistant, {
    courseID: Predicate.isNonEmptyString,
    assistantID: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.assistantID, "invalid_assistant");

    // Fetch the course document and its reference
    const [course, courseRef] = await getDocumentAndRef(CollectionOf<Course>('courses'), args.courseID);
    if (!course) { return fail("course_not_found"); }

    //------------- Authorization check (ensure the user is authorized to update the material)-------------------
    // Fetch user data
    const user = await getRequiredDocument<AppUser>(CollectionOf<AppUser>('users'), userId, { error: "user_not_found", status: 0 });

    // Verify the user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) { return fail("not_authorized"); }
    //------------------------------------------------------------------------------------------------------------

    try {

        if (course.assistants.includes(args.assistantID)) {
            await courseRef.update({ assistants: course.assistants.filter((id: StudentID) => id !== args.assistantID) });
        }

        return ok({});

    } catch (error) {
        console.error("Error remove assistant to Firestore:", error);
        return fail("firebase_error");
    }
});
