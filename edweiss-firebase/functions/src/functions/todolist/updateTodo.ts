/**
 * @file updateTodo.ts
 * @description Cloud function for updating a to do item in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import { Time } from 'utils/time';
import Functions = Todolist.Functions;

// Types
type Todo = Todolist.Todo;

// ------------------------------------------------------------
// ----------------  Update to do Cloud Function  -------------
// ------------------------------------------------------------

export const updateTodo = onAuthentifiedCall(Functions.updateTodo, async (userId, args) => {
	assertNonEmptyString(args.id, "invalid_id");

	const [todo, todoRef] = await getDocumentAndRef(CollectionOf<Todo>(`users/${userId}/todos/`), args.id);

	if (todo == undefined)
		return fail("firebase_error");

	const todoCollection = CollectionOf<Todo>(`users/${userId}/todos`);

	const existingTodos = await todoCollection.where('name', '==', args.name).get();

	if (!existingTodos.empty) {
		return fail("duplicate_todo");
	}

	const updatedFields: Partial<Todo> = {};
	if (args.name) updatedFields.name = args.name;
	if (args.status) updatedFields.status = args.status;
	if (args.description) updatedFields.description = args.description;
	if (args.dueDate) {
		let dueDate: Date;

		if (typeof args.dueDate === 'string') {
			dueDate = new Date(args.dueDate);
		} else {
			return fail('error_date');
		}

		try {
			updatedFields.dueDate = Time.fromDate(dueDate);
		} catch (error) {
			return fail('error_date');
		}
	}

	await todoRef.set({
		...todo,
		...updatedFields
	});

	return ok({});
});
