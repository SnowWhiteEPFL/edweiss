import { FunctionFolder, FunctionOf } from './functions';


namespace Todolist {

    export type TodoStatus = "yet" | "in_progress" | "done";

    export interface Todo {
        name: string,
        description?: string,
        status: TodoStatus;
    }


    export const Functions = FunctionFolder("todolist", {
        createTodo: FunctionOf<{ todo: Todo; }, {}, 'invalid_todo'>("createTodo"),
        updateTodo: FunctionOf<{ newTodo: Todo; id: string; }, {}, 'invalid_todo' | 'invalid_id' | 'firebase_error'>("updateTodo")
    });




}

export default Todolist;