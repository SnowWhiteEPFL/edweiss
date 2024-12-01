/**
 * @file updateAssignment.ts
 * @description Cloud function to update an assignment from a course
 * @author Florian Dinant
 */


import { Assignment, AssignmentType, Course, Course_functions } from 'model/school/courses';
import { Timestamp } from 'model/time';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertIsBetween, assertIsIn, assertNonEmptyString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


const validTypes: AssignmentType[] = ["submit", "quiz"]
const MAX_NAME_LENGTH = 20;


/**
 * Update an assignment for a course.
 * @param userId ID of the user invoking the function.
 * @param args Contains `courseID`, `assignmentID`, `name`, `type`, and `dueDateJSON`.
 * @returns {} on success or a failure status on error.
 */
export const updateAssignment = onAuthentifiedCall(Functions.updateAssignment, async (userId, args) => {

    // Validate input fields
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        assignmentID: Predicate.isNonEmptyString,
        assignmentJSON: Predicate.isNonEmptyString,
    });

    // Ensure `courseID` and `assignmentID` are non-empty strings
    assertNonEmptyString(args.courseID, "invalid_courseID");
    assertNonEmptyString(args.assignmentID, "invalid_assignmentID");
    assertNonEmptyString(args.assignmentJSON, "invalid_name");

    //-------------------------------------------------------------------------------------------------
    // Fetch course data
    const course = await getDocument<Course>(CollectionOf<Course>('courses'), args.courseID);
    if (!course) return fail("course_not_found");

    // Fetch user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

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
        assertIsBetween(assignmentData.name.length, 1, MAX_NAME_LENGTH, "invalid_name");
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