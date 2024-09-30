
import { TText } from '@/components/core/TText';
import { TView } from '@/components/core/containers/TView';
import FancyButton from '@/components/input/FancyButton';
import { router } from 'expo-router';

export default function TabTwoScreen() {
	return (
		<TView>
			<TText bold size={'xl'}>Explore</TText>
			<TText>
				A second tab ? Amazing !
			</TText>
			<FancyButton mb={'md'} onPress={() => router.push("/members/adamm")}>
				Go to Adamm's page
			</FancyButton>
			<FancyButton onPress={() => router.push("/members/ferdinand")}>
				Go to Ferdinand's page
			</FancyButton>
			<FancyButton onPress={() => router.push("/members/gustavo")}>
				Go to Gustavo's page
			</FancyButton>
			<FancyButton onPress={() => router.push("/members/gwenael")}>
				Go to Gwenael's page
			</FancyButton>
			<FancyButton onPress={() => router.push("/members/florian")}>
				Go to Florian's page
			</FancyButton>
			<FancyButton onPress={() => router.push("/members/tuan")}>
				Go to Tuan's page
			</FancyButton>
		</TView>
	);
}
