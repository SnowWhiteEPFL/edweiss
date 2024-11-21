/**
 * @file updateMaterial.ts
 * @description Cloud function to update a material from a course
 * @author Florian Dinant
 */


import { Course, Course_functions, Material, MaterialDocument, MaterialType } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocument, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString, assertThatFields, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


/**
 * Updates a material in a course.
 * @param userId ID of the authenticated user invoking the function.
 * @param args Contains `courseID`, `materialID`, and `materialJSON` with the updated material data.
 * @returns {} on success, or a fail status on error.
 */
export const updateMaterial = onAuthentifiedCall(Functions.updateMaterial, async (userId, args) => {
    // Validate the input fields
    assertThatFields(args, {
        courseID: Predicate.isNonEmptyString,
        materialID: Predicate.isNonEmptyString,
        materialJSON: Predicate.isNonEmptyString,
    });

    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.materialID, "invalid_id");
    assertNonEmptyString(args.materialJSON, "invalid_json");


    //------------- Authorization check (ensure the user is authorized to update the material)-------------------
    // Fetch course data
    const course = await getDocument<Course>(CollectionOf<Course>('courses'), args.courseID);
    if (!course) return fail("course_not_found");

    // Fetch user data
    const user = await getDocument<AppUser>(CollectionOf<AppUser>('users'), userId);
    if (!user) return fail("user_not_found");

    // Verify the user is a professor of the course
    if (user.type !== "professor" || !course.professors?.includes(userId)) { return fail("not_authorized"); }
    //------------------------------------------------------------------------------------------------------------

    // Parse the material JSON
    let materialData: Material;
    try {
        materialData = JSON.parse(args.materialJSON);
    } catch (error) {
        console.error("Error parsing materialJSON:", error);
        return fail("invalid_json");
    }

    // Prepare updated fields
    const updatedFields: Partial<Material> = {};
    if (materialData.title) updatedFields.title = materialData.title;
    if (materialData.description) updatedFields.description = materialData.description;
    if (materialData.from) updatedFields.from = materialData.from;
    if (materialData.to) updatedFields.to = materialData.to;
    if (materialData.docs) {
        try {
            updatedFields.docs = materialData.docs.map((doc: MaterialDocument) => {
                assertNonEmptyString(doc.title, "invalid_doc_title");
                assertNonEmptyString(doc.url, "invalid_doc_url");
                assertNonEmptyString(doc.type, "invalid_doc_type");
                return {
                    title: doc.title,
                    url: doc.url,
                    type: doc.type as MaterialType,
                };
            });
        } catch (error) {
            console.error("Invalid document fields in docs array:", error);
            return fail("invalid_docs");
        }
    }

    try {
        // Fetch the material and its reference
        const [material, materialRef] = await getDocumentAndRef(
            CollectionOf<Material>(`courses/${args.courseID}/materials`),
            args.materialID
        );
        if (!material) { return fail("material_not_found"); }

        // Update the material with the new fields
        await materialRef.update(updatedFields);
        return ok({});
    } catch (error) {
        console.error("Error updating material:", error);
        return fail("firebase_error");
    }
});