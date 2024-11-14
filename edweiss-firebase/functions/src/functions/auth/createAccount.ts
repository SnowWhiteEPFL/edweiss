import { Auth } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { Collections, getDocumentAndRef } from 'utils/firestore';
import { Predicate, tag } from 'utils/sanitizer';
import { OK, fail } from 'utils/status';
import { Time } from 'utils/time';

export const createAccount = onSanitizedCall(Auth.Functions.createAccount, {
	name: tag(Predicate.isNonEmptyString, 'invalid_name')
}, async (userId, args) => {
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
