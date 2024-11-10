/**
 * @file todo.ts
 * @description Module for managing to do items in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FunctionFolder, FunctionOf } from './functions';
import { Timestamp } from './time';


// ------------------------------------------------------------
// ---------------------  To do Namespace  --------------------
// ------------------------------------------------------------
namespace Todolist {

    export type TodoStatus = "yet" | "in_progress" | "done" | "archived";

    export interface Todo {
        name: string,
        description?: string,
        status: TodoStatus,
        dueDate?: Timestamp,
    }


    export const Functions = FunctionFolder("todolist", {
        createTodo: FunctionOf<{ name: string; description?: string; status: TodoStatus; dueDate?: string; }, {}, 'invalid_arg' | 'error_date' | 'firebase_error'>("createTodo"),
        updateTodo: FunctionOf<{ name?: string; description?: string; status?: TodoStatus; dueDate?: string; id: string; }, {}, 'invalid_arg' | 'invalid_id' | 'error_date' | 'firebase_error'>("updateTodo"),
        deleteTodo: FunctionOf<{ id: string; }, {}, 'invalid_id' | 'firebase_error'>("deleteTodo")
    });




}

export default Todolist;