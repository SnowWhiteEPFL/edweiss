import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import messaging from '@react-native-firebase/messaging';
import { router } from 'expo-router';

const ExploreTab: ApplicationRoute = () => {

	async function registerToken() {
		const fcmToken = await messaging().getToken();

		// console.log("FCM Token: " + token + i18next);

		// const res = await callFunction('registerFCMToken', { fcmToken: token });

		// console.log("Res register tokens : " + JSON.stringify(res));
	}

	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>
				<FancyButton onPress={() => { router.push('/(app)/lectures/slides' as any); }} >
					<TText> Go To Lecture's slide</TText>
				</FancyButton>
			</TView>
		</>
	);
};

export default ExploreTab;
