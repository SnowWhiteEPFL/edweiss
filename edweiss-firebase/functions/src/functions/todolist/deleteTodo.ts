import * as admin from 'firebase-admin';
import Todolist from 'model/todo';
import { onAuthentifiedCall } from 'utils/firebase';
import { fail, ok } from 'utils/status';

import Functions = Todolist.Functions;

export const deleteTodo = onAuthentifiedCall(Functions.deleteTodo, async (userId, args) => {
    if (!args.id)
        return fail("invalid_id");

    const db = admin.firestore();

    try {
        await db.collection(`users/${userId}/todos_aas/`).doc(args.id).delete(); // TODO: change name to todos
    } catch (error) {
        return fail("firebase_error");
    }

    return ok({});
});
