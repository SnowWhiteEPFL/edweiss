/**
 * @file removeProfessor.ts
 * @description Cloud function to remove an professor from a course
 * @author Florian Dinant
 */


import { Course, Course_functions } from 'model/school/courses';
import { AppUser, ProfessorID } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


export const removeProfessor = onSanitizedCall(Functions.removeProfessor, {
    courseID: Predicate.isNonEmptyString,
    professorID: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.professorID, "invalid_professor_id");

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

        if (course.professors.includes(args.professorID)) {
            await courseRef.update({ professors: course.professors.filter((id: ProfessorID) => id !== args.professorID) });
        }

        return ok({});

    } catch (error) {
        console.error("Error remove professor to Firestore:", error);
        return fail("firebase_error");
    }
});