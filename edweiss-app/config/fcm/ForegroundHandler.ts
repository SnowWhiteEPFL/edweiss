// import { FCMMessage } from '@/model/fcm';
// import { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

// export default async function FCMForegroundHandler(message: FirebaseMessagingTypes.RemoteMessage, handler: ()) {
// 	console.log("Foreground message " + JSON.stringify(message));

// 	if (message.data == undefined)
// 		return;

// 	handleFCMMessage(JSON.parse(message.data.message as any) as any as FCMMessage);
// }

// async function handleFCMMessage(message: FCMMessage) {
// 	console.log("FCMMessage received ! " + JSON.stringify(message));

// 	if (message.type == "go_to_slide") {
// 		// Handle here stuff.
// 	}
// }
