import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

import Functions = Todolist.Functions;

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
