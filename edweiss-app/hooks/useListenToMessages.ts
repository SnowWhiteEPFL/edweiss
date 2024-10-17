import { useEffect } from 'react';

import { FCMMessage } from '@/model/fcm';
import messaging from '@react-native-firebase/messaging';

export default function useListenToMessages(handler: (msg: FCMMessage) => void) {
	useEffect(() => {
		const unsubscribe = messaging().onMessage(message => {
			console.log("Foreground message " + JSON.stringify(message));

			if (message.data == undefined)
				return;

			handler(JSON.parse(message.data.message as any) as any as FCMMessage);
		});
		return unsubscribe;
	}, []);
}

/**
 *
 * Example here of handler
 *
 */

// async function handleFCMMessage(message: FCMMessage) {
// 	console.log("FCMMessage received ! " + JSON.stringify(message));

// 	if (message.type == "go_to_slide") {
// 		// Handle here stuff.
// 	}
// }
