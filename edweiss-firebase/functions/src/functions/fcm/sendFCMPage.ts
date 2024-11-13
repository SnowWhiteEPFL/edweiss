import sendFCMMessage from 'actions/sendFCMMessage';
import { FCMCommunication } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { Collections, getDocument } from 'utils/firestore';
import { assertPositiveNumber } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const sendFCMPage = onAuthentifiedCall(FCMCommunication.Functions.sendFCMPage, async (userId, args) => {
	assertPositiveNumber(args.page);

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

