import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';
import Todo = Todolist.Todo;
import Functions = Todolist.Functions;


export const createTodo = onAuthentifiedCall(Functions.createTodo, async (userId, args) => {
    if (!args.todo)
        return fail("invalid_todo");

    const todoCollection = CollectionOf<Todo>(`users/${userId}/todos`);

    const res = await todoCollection.add(args.todo);

    return ok({ id: res.id });
});
