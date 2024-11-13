import { Auth } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { Collections, getDocumentAndRef } from 'utils/firestore';
import { assertNonEmptyString } from 'utils/sanitizer';
import { OK, fail } from 'utils/status';
import { Time } from 'utils/time';

export const createAccount = onAuthentifiedCall(Auth.Functions.createAccount, async (userId, args) => {
	assertNonEmptyString(args.name, "invalid_name");

	const [user, userRef] = await getDocumentAndRef(Collections.users, userId);

	if (user != undefined)
		return fail("already_existing_account");

	await userRef.set({
		type: "student",
		createdAt: Time.now(),
		name: args.name,

		courses: [],
		fcmTokens: []

	});

	return OK;
});
