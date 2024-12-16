/**
 * @file updateMaterial.ts
 * @description Cloud function to update a material from a course
 * @author Florian Dinant
 */


import { Course, Course_functions, Material, MaterialDocument, MaterialType, MAX_MATERIAL_DESCRIPTION_LENGTH, MAX_MATERIAL_TITLE_LENGTH } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { assertIsBetween, assertNonEmptyString, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


/**
 * Updates a material in a course.
 * @param userId ID of the authenticated user invoking the function.
 * @param args Contains `courseID`, `materialID`, and `materialJSON` with the updated material data.
 * @returns {} on success, or a fail status on error.
 */
export const updateMaterial = onSanitizedCall(Functions.updateMaterial, {
    courseID: Predicate.isNonEmptyString,
    materialID: Predicate.isNonEmptyString,
    materialJSON: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertNonEmptyString(args.courseID, "invalid_id");
    assertNonEmptyString(args.materialID, "invalid_id");
    assertNonEmptyString(args.materialJSON, "invalid_json");

    //------------- Authorization check (ensure the user is authorized to update the material)-------------------
    // Fetch course data
    const course = await getRequiredDocument<Course>(CollectionOf<Course>('courses'), args.courseID, { error: "course_not_found", status: 0 });

    // Fetch user data
    const user = await getRequiredDocument<AppUser>(CollectionOf<AppUser>('users'), userId, { error: "user_not_found", status: 0 });

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

    assertIsBetween(materialData.title.length, 1, MAX_MATERIAL_TITLE_LENGTH, "material_title_too_long");
    assertIsBetween(materialData.description.length, 0, MAX_MATERIAL_DESCRIPTION_LENGTH, "material_description_too_long");

    // Prepare updated fields
    const updatedFields: Partial<Material> = {};
    if (materialData.title) updatedFields.title = materialData.title;
    if (materialData.description || materialData.description === '') updatedFields.description = materialData.description;
    if (materialData.from) updatedFields.from = materialData.from;
    if (materialData.to) updatedFields.to = materialData.to;
    if (materialData.docs) {
        try {
            updatedFields.docs = materialData.docs.map((doc: MaterialDocument) => {
                assertNonEmptyString(doc.title, "invalid_doc_title");
                assertNonEmptyString(doc.uri, "invalid_doc_uri");
                assertNonEmptyString(doc.type, "invalid_doc_type");
                return {
                    title: doc.title,
                    uri: doc.uri,
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