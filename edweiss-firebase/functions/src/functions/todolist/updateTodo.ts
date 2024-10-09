import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';
import Todo = Todolist.Todo;
import Functions = Todolist.Functions;


export const updateTodo = onAuthentifiedCall(Functions.updateTodo, async (userId, args) => {
    if (!args.newTodo)
        return fail("invalid_todo");
    if (!args.id)
        return fail("invalid_id");

    const [todo, todoRef] = await getDocumentAndRef(CollectionOf<Todo>(`users/${userId}/todos_aas/`), args.id);

    if (todo == undefined)
        return fail("firebase_error");

    await todoRef.set({
        ...todo,
        ...args.newTodo
    });

    return ok({});
});
