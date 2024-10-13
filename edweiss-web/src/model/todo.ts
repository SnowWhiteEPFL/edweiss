import { FunctionFolder, FunctionOf } from './functions';
import { Timestamp } from './time';


namespace Todolist {

    export type TodoStatus = "yet" | "in_progress" | "done" | "archived";

    export interface Todo {
        name: string,
        description?: string,
        status: TodoStatus,
        dueDate?: Timestamp,
    }


    export const Functions = FunctionFolder("todolist", {
        createTodo: FunctionOf<{ todo: Todo; }, {}, 'invalid_todo'>("createTodo"),
        updateTodo: FunctionOf<{ newTodo: Todo; id: string; }, {}, 'invalid_todo' | 'invalid_id' | 'firebase_error'>("updateTodo"),
        deleteTodo: FunctionOf<{ id: string; }, {}, 'invalid_id' | 'firebase_error'>("deleteTodo")
    });




}

export default Todolist;