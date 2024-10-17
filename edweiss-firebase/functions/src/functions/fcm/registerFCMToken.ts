import { FCMCommunication } from 'model/users';
import { onAuthentifiedCall } from 'utils/firebase';
import { Collections, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const registerFCMToken = onAuthentifiedCall(FCMCommunication.Functions.registerFCMToken, async (userId, args) => {


    if (!userId)
        return fail("invalid_userID");
    if (!args.fcmToken)
        return fail("invalid_fcm_tokens");

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
