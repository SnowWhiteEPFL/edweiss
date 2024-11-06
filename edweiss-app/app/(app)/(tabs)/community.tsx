import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import Experiments from '@/model/experiments';
import { router } from 'expo-router';
import { useState } from 'react';


const CommunityTab: ApplicationRoute = () => {
	const [response, setResponse] = useState("");

	async function generateAIResponse() {
		setResponse("Calling function...");

		try {
			const res = await callFunction(Experiments.functions.promptAI, {
				task: "This is a software engineering class. Correct the following lecture audio transcript.",
				content: "Helwo eveyrone wlecome to today's lecture, anyways to day we will see New content."
			});

			if (res.status == 1) {
				setResponse(res.data);
			} else {
				setResponse(res.error);
			}
		} catch (e) {
			console.log(e);
		}
	}

	return (
		<>
			<RouteHeader title={"Community"} />

			<TView>
				<TText>
					Explore and experiment incommunity.tsx !
				</TText>
			</TView>

			<FancyButton mt={10} mb={10} onPress={() => router.push("deck" as any)} backgroundColor='pink'>
				Memento App
			</FancyButton >

			<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo` as any)}>
				My Todos
			</FancyButton>

			<FancyButton mt={'md'} mb={'md'} onPress={generateAIResponse}>
				Generate AI response
			</FancyButton>

			<TText>
				{JSON.stringify(response)}
			</TText>
		</>
	);
};

export default CommunityTab;