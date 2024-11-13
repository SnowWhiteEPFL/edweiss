/**
 * @file deleteTodo.ts
 * @description Cloud function for deleting a to do item in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Todolist from 'model/todo';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { OK } from 'utils/status';

import Functions = Todolist.Functions;


// ------------------------------------------------------------
// ----------------  Delete to do Cloud Function  -------------
// ------------------------------------------------------------

export const deleteTodo = onSanitizedCall(Functions.deleteTodo, {
	id: Predicate.isNonEmptyString
}, async (userId, args) => {
	await getDocumentRef(CollectionOf(`users/${userId}/todos/`), args.id).delete();

	return OK;
});
