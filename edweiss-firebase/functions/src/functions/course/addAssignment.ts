/**
 * @file addAssignment.ts
 * @description Cloud function to add an assignment to the course
 * @author Florian Dinant
 */


import { Assignment, AssignmentType, Course, Course_functions, MAX_ASSIGNMENT_NAME_LENGTH } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getRequiredDocument } from 'utils/firestore';
import { Predicate, assertIsBetween, assertIsIn, assertString } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


// Define the valid assignment types
const validTypes: AssignmentType[] = ["submission", "quiz"];


/**
 * Adds a new assignment to a course.
 * @param userId ID of the user invoking the function.
 * @param args Contains `courseID`, `type`, `name`, and `dueDateJSON`.
 * @returns { id: string } on success, or a failure status on error.
 */
export const addAssignment = onSanitizedCall(Functions.addAssignment, {
    courseID: Predicate.isNonEmptyString,
    assignmentJSON: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertString(args.courseID, "invalid_courseID");
    assertString(args.assignmentJSON, "invalid_assignmentJSON");

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

    // Validate the parsed assignment structure
    if (!assignmentData.type || !assignmentData.name || !assignmentData.dueDate) { return fail("invalid_assignment_structure"); }

    // Validate the assignment name length
    assertIsBetween(assignmentData.type.length, 1, MAX_ASSIGNMENT_NAME_LENGTH, "invalid_name");
    // Validate the assignment type
    assertIsIn(assignmentData.type, validTypes, "invalid_type");

    // Construct the assignment object to be inserted
    const assignmentToInsert: Assignment = {
        name: assignmentData.name,
        type: assignmentData.type,
        dueDate: assignmentData.dueDate,
    };

    // Insert the assignment into the Firestore collection
    try {
        const assignmentsCollection = CollectionOf<Assignment>(`courses/${args.courseID}/assignments`);
        if (!assignmentsCollection) {
            console.error("Error getting assignments collection.");
            return fail("firebase_error");
        }
        const res = await assignmentsCollection.add(assignmentToInsert);

        // Check if Firestore generated a valid ID
        if (!res.id) {
            console.error("No ID generated for the assignment.");
            return fail("firebase_error");
        }

        return ok({ assignmentID: res.id });
    } catch (error) {
        console.error("Error adding assignment to Firestore:", error);
        return fail("firebase_error");
    }
});
