/**
 * @file createCourse.ts
 * @description Cloud function to create a course
 * @author Florian Dinant
 */

import { Course, Course_functions, Section } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate, assertIsIn, assertNonEmptyString, assertString, assertThatFields } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;

const allowedSections: Section[] = ["IN", "SC", "MA", "PH", "CGC", "EL", "GM", "MT", "MX", "SV", "AR", "GC", "SIE"];

/**
 * Create a new course
 * @param userId The user ID of the requester
 * @param args courseJSON: JSON string of the course object
 * @returns {courseID: string} on success, with a fail status on error
 */
export const createCourse = onAuthentifiedCall(Functions.createCourse, async (userId, args) => {
    // Validate input
    assertThatFields(args, {
        courseJSON: Predicate.isNonEmptyString,
    });
    assertNonEmptyString(args.courseJSON, "invalid_arg");

    // Parse the course JSON
    let course: Course;
    try {
        course = JSON.parse(args.courseJSON) as Course;
    } catch (error) {
        console.error("Error parsing course JSON:", error);
        return fail("invalid_json");
    }

    // SECURITY: Verify if the user has permission to create a course
    // (Customize based on your app's permissions logic)
    if (!isUserAuthorizedToCreateCourse(userId)) {
        return fail("permission_denied");
    }

    // Validate the Course object fields
    try {
        assertString(course.name, "invalid_course_name");
        assertString(course.description, "invalid_course_description");

        // Validate professors and assistants lists
        course.professors.forEach((prof) => assertString(prof, "invalid_professor_id"));
        course.assistants.forEach((assistant) => assertString(assistant, "invalid_assistant_id"));

        // Validate periods
        course.periods.forEach((period) => {
            assertString(period.type, "invalid_period_type");
        });

        // Validate section and credits
        assertIsIn(course.section, allowedSections, "invalid_section");
        if (typeof course.credits !== "number" || course.credits < 0) {
            throw new Error("invalid_credits");
        }
    } catch (error) {
        console.error("Course validation error:", error);
        return fail("invalid_course_data");
    }

    // Reference to the courses collection
    const coursesCollection = CollectionOf<Course>('courses');

    // Create a new course document
    const newCourseRef = coursesCollection.doc(); // Auto-generated ID
    const courseID = newCourseRef.id;

    try {
        // Save the course data in Firestore
        await newCourseRef.set({
            ...course,
            started: false, // Default value for "started"
            newAssignments: false, // Default value for "newAssignments"
        });

        return ok({ courseID });
    } catch (error) {
        console.error("Failed to create course:", error);
        return fail("cannot_create_course");
    }
});

/**
 * Check if a user is authorized to create a course
 * @param userId The user ID
 * @returns true if authorized, false otherwise
 */
function isUserAuthorizedToCreateCourse(userId: string): boolean {
    // Placeholder for permission logic : WHITE LIST
    const allowedUsers = ["jYCILJoNlBPBIMutE4uk7MYj9EX2", "HGm74hEoeUQxVd8D3LuDFTMLmAk2"]; // Replace with your own logic
    return allowedUsers.includes(userId);
}