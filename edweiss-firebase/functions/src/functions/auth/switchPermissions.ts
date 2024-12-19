import { Auth } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { Collections, getDocumentAndRef } from 'utils/firestore';
import { OK, fail } from 'utils/status';

export const switchPermissions = onSanitizedCall(Auth.Functions.switchPermissions, {}, async (userId) => {
    const [user, userRef] = await getDocumentAndRef(Collections.users, userId);

    if (user == undefined)
        return fail("account_not_found");

    await userRef.update({
        type: user.type === "professor" ? "student" : "professor"
    });

    return OK;
});