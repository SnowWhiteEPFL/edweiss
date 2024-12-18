/**
 * @file addMaterial.ts
 * @description Cloud function to add a material to the course
 * @author Florian Dinant
 */


import { Course, Course_functions, Material, MaterialType, MAX_MATERIAL_DESCRIPTION_LENGTH, MAX_MATERIAL_TITLE_LENGTH } from 'model/school/courses';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getRequiredDocument } from 'utils/firestore';
import { assertIsBetween, assertIsIn, assertNonEmptyString, Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = Course_functions.Functions;


const validTypes: MaterialType[] = ["slides", "exercises", "feedbacks", "other"];


/**
 * Adds a new material to a course.
 * @param userId ID of the authenticated user invoking the function.
 * @param args Contains `courseID` and `materialJSON` with the material data to be added.
 * @returns The ID of the added material on success, or a failure status on error.
 */
export const addMaterial = onSanitizedCall(Functions.addMaterial, {
    courseID: Predicate.isNonEmptyString,
    materialJSON: Predicate.isNonEmptyString,
}, async (userId, args) => {

    // Validate the input fields
    assertNonEmptyString(args.courseID, "invalid_arg");
    assertNonEmptyString(args.materialJSON, "invalid_arg");

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

    // Parse the material JSON
    let materialData: Material;
    try {
        materialData = JSON.parse(args.materialJSON);
    } catch (error) {
        console.error("Error parsing materialJSON:", error);
        return fail("invalid_json");
    }

    // Validate the parsed material structure
    if (!materialData.title || materialData.description == undefined || !materialData.from || !materialData.to || !Array.isArray(materialData.docs)) {
        return fail("invalid_material_structure");
    }

    assertIsBetween(materialData.title.length, 1, MAX_MATERIAL_TITLE_LENGTH, "material_title_too_long");
    assertIsBetween(materialData.description.length, 0, MAX_MATERIAL_DESCRIPTION_LENGTH, "material_description_too_long");

    for (const [index, doc] of materialData.docs.entries()) {
        if (!doc.uri || !doc.title) {
            console.error(`Missing fields in document at index ${index}:`, doc);
            return fail("invalid_material_doc");
        }
        assertIsIn(doc.type, validTypes, "invalid_material_type");
    }

    // Construct the material object to be inserted
    const materialToInsert: Material = {
        title: materialData.title,
        description: materialData.description,
        from: materialData.from,
        to: materialData.to,
        docs: materialData.docs.map((doc) => ({
            uri: doc.uri,
            title: doc.title,
            type: doc.type,
        })),
    };

    // Add the material to the Firestore collection
    try {
        const materialsCollection = CollectionOf<Material>(`courses/${args.courseID}/materials`);
        if (!materialsCollection) {
            console.error("Materials collection not found for courseID:", args.courseID);
            return fail("firebase_error");
        }

        const res = await materialsCollection.add(materialToInsert);
        if (!res.id) {
            console.error("Failed to retrieve document ID after adding material.");
            return fail("firebase_error");
        }

        return ok({ materialID: res.id });
    } catch (error) {
        console.error("Error adding material to Firestore:", error);
        return fail("firebase_error");
    }
});
