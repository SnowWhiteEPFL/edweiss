import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import { FCMCommunication } from '@/model/users';
import messaging from '@react-native-firebase/messaging';
import { router } from 'expo-router';
import { useState } from 'react';

import Functions = FCMCommunication.Functions;

const ExploreTab: ApplicationRoute = () => {
	const [pageCount, setPageCount] = useState<number>(1);

	async function registerToken() {
		const fcmToken = await messaging().getToken();

		console.log("FCM Token: " + fcmToken + "\n");
		try {
			const res = await callFunction(Functions.registerFCMToken, { fcmToken: fcmToken });
			console.log("Res register tokens : " + JSON.stringify(res));
		} catch (error) {
			console.error("Error registering FCM token: ", error);
		}

	}

	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>

				<FancyButton onPress={() => {
					router.push({
						pathname: '/(app)/lectures/slides' as any,
						params: {
							courseNameString: "edweiss-demo",
							lectureIdString: "xgy30FeIOHAnKtSfPjAe"
						}

					});
				}} >
					<TText> Go To Lecture's slide</TText>
				</FancyButton>

				<TView>
					<FancyButton onPress={registerToken}>
						<TText> Send my Token</TText>
					</FancyButton>
				</TView>


				<TView>
					<FancyButton onPress={() => {
						console.log('Next Page Pressed');
						setPageCount(pageCount + 1);
						callFunction(Functions.sendFCMPage, { page: pageCount });


					}}>
						<TText> Next Page </TText>
					</FancyButton>
				</TView>

				<FancyButton onPress={() => {
					router.push({
						pathname: '/(app)/lectures/remotecontrol' as any,
						params: {
							courseNameString: "edweiss-demo",
							lectureIdString: "xgy30FeIOHAnKtSfPjAe"
						}

					});
				}} >
					<TText> Go to STRC</TText>
				</FancyButton>

			</TView >
		</>
	);
};

export default ExploreTab;
