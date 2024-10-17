import { Auth } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { Collections, getDocumentAndRef } from 'utils/firestore';
import { OK, fail } from 'utils/status';
import { Time } from 'utils/time';

export const createAccount = onAuthentifiedCall(Auth.Functions.createAccount, async (userId, args) => {
	const [user, userRef] = await getDocumentAndRef(Collections.users, userId);

	if (user != undefined)
		return fail("already_existing_account");

	await userRef.set({
		type: "professor",
		createdAt: Time.now(),
		name: args.name,
		type: "student",
		courses: []
	});

	return OK;
});
