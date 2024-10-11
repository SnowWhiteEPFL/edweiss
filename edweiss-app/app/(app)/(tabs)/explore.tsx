import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import ModalContainer from '@/components/core/modal/ModalContainer';
import FancyButton from '@/components/input/FancyButton';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import Voice from '@react-native-voice/voice';
import { router } from 'expo-router';
import { useRef, useState } from 'react';

const ExploreTab: ApplicationRoute = () => {
	const modalRef = useRef<BottomSheetModal>(null);
	const [recording, setRecording] = useState(false);
	const [talked, settalked] = useState("");
	// const [error, seterror] = useState("");

	Voice.onSpeechStart = () => { setRecording(true); };
	Voice.onSpeechEnd = () => { setRecording(false); };

	Voice.onSpeechError = (e: any) => { console.log(e.error); };
	Voice.onSpeechResults = (res) => { settalked(res.value ? res.value[0] : ""); };

	const startRecording = async () => {
		try {
			await Voice.start('en-US');
		} catch (e: any) {
			console.log(e);
			// seterror(e);
		}
	};

	const stopRecoding = async () => {
		try {
			await Voice.stop();
		} catch (e: any) {
			console.log(e);
			//seterror(e);
		}
	};

	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>
				<TText>
					Explore and experiment in explore.tsx !
				</TText>
			</TView>

			<FancyButton onPress={() => router.push(`/(app)/todo` as any)}>
				My Todos
			</FancyButton>

			<ModalContainer modalRef={modalRef}>
				<TText>
					Hello, I'm a Modal !
				</TText>
				<FancyButton backgroundColor='red' onPress={() => modalRef.current?.close()}>
					Close modal
				</FancyButton>
			</ModalContainer>


			<FancyButton onPress={() => {
				if (recording) {
					stopRecoding();
				} else {
					startRecording();
				}
				setRecording(!recording);

			}}>
				{recording ? "Recording..." : "Not recording"}
			</FancyButton>
			<TText>
				You said: {talked}
			</TText>
			{/* <TText>
				Error: {error}
			</TText> */}

		</>
	);
};

export default ExploreTab;
