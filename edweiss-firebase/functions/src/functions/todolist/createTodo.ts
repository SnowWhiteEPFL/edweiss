/**
 * @file createTodo.ts
 * @description Cloud function for creating a to do item in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';
import { Time } from 'utils/time';
import Functions = Todolist.Functions;

// Types
type Todo = Todolist.Todo;
type TodoStatus = Todolist.TodoStatus;


// ------------------------------------------------------------
// ----------------  Create to do Cloud Function  -------------
// ------------------------------------------------------------

export const createTodo = onAuthentifiedCall(Functions.createTodo, async (userId, args) => {
    if (!args.name || !args.status && (args.status !== "yet" && args.status !== "in_progress" && args.status !== "done" && args.status !== "archived"))
        return fail("invalid_arg");

    const name: string = args.name;
    const status: TodoStatus = args.status;

    const todoCollection = CollectionOf<Todo>(`users/${userId}/todos`);

    const todoToInsert: Todo = {
        name: name,
        status: status,
    };

    if (args.description) {
        const description: string = args.description;
        todoToInsert.description = description;
    }

    if (args.dueDate) {
        let dueDate: Date;

        if (typeof args.dueDate === 'string') {
            dueDate = new Date(args.dueDate);
        } else {
            return fail('error_date');
        }

        try {
            todoToInsert.dueDate = Time.fromDate(dueDate);
        } catch (error) {
            return fail('error_date');
        }
    }

    try {
        const res = await todoCollection.add(todoToInsert);

        if (!res.id) {
            return fail("firebase_error");
        }

        return ok({ id: res.id });

    } catch (error) {
        return fail("firebase_error");
    }
});
