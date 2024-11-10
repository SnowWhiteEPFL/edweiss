/**
 * @file deleteTodo.ts
 * @description Cloud function for deleting a to do item in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

import Functions = Todolist.Functions;


// ------------------------------------------------------------
// ----------------  Delete to do Cloud Function  -------------
// ------------------------------------------------------------

export const deleteTodo = onAuthentifiedCall(Functions.deleteTodo, async (userId, args) => {
    if (!args.id)
        return fail("invalid_id");

    try {
        await getDocumentRef(CollectionOf(`users/${userId}/todos/`), args.id).delete();
    } catch (error) {
        return fail("firebase_error");
    }

    return ok({});
});
