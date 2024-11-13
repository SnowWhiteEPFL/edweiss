import { FCMCommunication } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { Collections, getDocumentAndRef } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const registerFCMToken = onSanitizedCall(FCMCommunication.Functions.registerFCMToken, {
	fcmToken: Predicate.isNonEmptyString
}, async (userId, args) => {
	const [user, userRef] = await getDocumentAndRef(Collections.users, userId);

	if (!user)
		return fail("invalid_userID");

	const tokens = user.fcmTokens || [];
	if (!tokens.includes(args.fcmToken)) {
		tokens.push(args.fcmToken);
		await userRef.set({ fcmTokens: tokens }, { merge: true });
	}

	return ok('successfully_saved_token');
});
