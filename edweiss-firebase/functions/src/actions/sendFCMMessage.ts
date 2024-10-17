
import { AppUser } from 'model/users';

import { messaging } from 'firebase-admin';
import { FCMMessage } from 'model/fcm';

export default async function sendFCMMessage(user: AppUser, message: FCMMessage) {
	if (user.fcmTokens == undefined)
		return;

	for (let i = 0; i < user.fcmTokens.length; i++) {
		messaging().send({
			token: user.fcmTokens[i],
			data: {
				message: JSON.stringify(message)
			},
			android: {
				priority: 'high'
			}
		});
	}
}
