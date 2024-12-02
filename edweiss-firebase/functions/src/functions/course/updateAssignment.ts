/**
 * @file updateAssignment.ts
 * @description Cloud function to update an assignment from a course
 * @author Florian Dinant
 */


import { Assignment, AssignmentType, Course, Course_functions, MAX_ASSIGNMENT_NAME_LENGTH } from 'model/school/courses';
import { Timestamp } from 'model/time';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { assertIsBetween, assertIsIn, assertNonEmptyString, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


const validTypes: AssignmentType[] = ["submission", "quiz"];


/**
 * Update an assignment for a course.
 * @param userId ID of the user invoking the function.
 * @param args Contains `courseID`, `assignmentID`, `name`, `type`, and `dueDateJSON`.
 * @returns {} on success or a failure status on error.
 */
export const updateAssignment = onSanitizedCall(Functions.updateAssignment, {
    courseID: Predicate.isNonEmptyString,
    assignmentID: Predicate.isNonEmptyString,
    assignmentJSON: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate input fields
    assertNonEmptyString(args.courseID, "invalid_courseID");
    assertNonEmptyString(args.assignmentID, "invalid_assignmentID");
    assertNonEmptyString(args.assignmentJSON, "invalid_name");

    //-------------------------------------------------------------------------------------------------
    // Fetch course data
    const course = await getRequiredDocument<Course>(CollectionOf<Course>('courses'), args.courseID, { error: "course_not_found", status: 0 });

    // Fetch user data
    const user = await getRequiredDocument<AppUser>(CollectionOf<AppUser>('users'), userId, { error: "user_not_found", status: 0 });

    // Verify user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) {
        return fail("not_authorized");
    }
    //-------------------------------------------------------------------------------------------------

    // Parse the assignment JSON
    let assignmentData: Assignment;
    try {
        assignmentData = JSON.parse(args.assignmentJSON);
    } catch (error) {
        console.error("Error parsing assignmentJSON:", error);
        return fail("invalid_json");
    }

    // Build the `updatedFields` object for the assignment
    const updatedFields: Partial<Assignment> = {};
    if (assignmentData.name) {
        assertNonEmptyString(assignmentData.name, "invalid_name");
        assertIsBetween(assignmentData.name.length, 1, MAX_ASSIGNMENT_NAME_LENGTH, "invalid_name");
        updatedFields.name = assignmentData.name as string;
    }
    if (assignmentData.type) {
        assertNonEmptyString(assignmentData.type, "invalid_type");
        assertIsIn(assignmentData.type, validTypes, "invalid_type");
        updatedFields.type = assignmentData.type as AssignmentType;
    }

    if (assignmentData.dueDate &&
        typeof assignmentData.dueDate.seconds === 'number' &&
        typeof assignmentData.dueDate.nanoseconds === 'number'
    ) {
        updatedFields.dueDate = assignmentData.dueDate as Timestamp;
    }

    //-------------------------------------------------------------------------------------------------
    try {
        // Fetch the assignment and its reference
        const [assignment, assignmentRef] = await getDocumentAndRef(
            CollectionOf<Assignment>(`courses/${args.courseID}/assignments/`),
            args.assignmentID
        );

        // Ensure the assignment exists
        if (!assignment) return fail("assignment_not_found");

        // Update the assignment with the new fields
        await assignmentRef.update(updatedFields);
        return ok({});
    } catch (error) {
        console.error("Error updating assignment:", error);
        return fail("firebase_error");
    }
    //-------------------------------------------------------------------------------------------------
});