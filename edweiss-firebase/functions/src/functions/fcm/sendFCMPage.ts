import sendFCMMessage from 'actions/sendFCMMessage';
import { FCMCommunication } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { Collections, getDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const sendFCMPage = onSanitizedCall(FCMCommunication.Functions.sendFCMPage, {
	page: Predicate.isPositive
}, async (userId, args) => {
	const user = await getDocument(Collections.users, userId);

	if (!user)
		return fail("invalid_userID");


	try {
		await sendFCMMessage(user, { type: 'go_to_slide', slideIndex: args.page });
	} catch (error) {
		return fail('firebase_error');
	}

	return ok('successfully_sent');
});

