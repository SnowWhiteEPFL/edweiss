/**
 * @file removeMaterial.ts
 * @description Cloud function to remove a material from a course
 * @author Florian Dinant
 */


import { Course, Course_functions, Material } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


/**
 * Removes a material from a course.
 * @param userId ID of the authenticated user invoking the function.
 * @param args Contains `courseID` and `materialID` with the material to be removed.
 * @returns {} on success, with a fail status on error.
 */
export const removeMaterial = onAuthentifiedCall(Functions.removeMaterial, async (userId, args) => {

    // Validate the input fields
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        materialID: Predicate.isNonEmptyString,
    });
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.materialID, "invalid_id");

    //-------------------------------------------------------------------------------------------------
    // Fetch course data
    const course = await getDocument<Course>(CollectionOf<Course>('courses'), args.courseID);
    if (!course) return fail("course_not_found");

    // Fetch user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

    // Verify the user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) {
        return fail("not_authorized");
    }
    //-------------------------------------------------------------------------------------------------

    try {
        // Fetch the material document and its reference
        const [material, materialRef] = await getDocumentAndRef(
            CollectionOf<Material>(`courses/${args.courseID}/materials`),
            args.materialID
        );

        if (!material) {
            return fail("material_not_found");
        }

        // Delete the material
        await materialRef.delete();
        return ok({});
    } catch (error) {
        console.error("Error removing material:", error);
        return fail("firebase_error");
    }
});