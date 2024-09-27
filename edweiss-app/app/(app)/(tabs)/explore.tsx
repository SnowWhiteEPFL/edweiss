
import { TText } from '@/components/core/TText';
import { TView } from '@/components/core/TView';
import FancyButton from '@/components/input/FancyButton';
import { Href, router } from 'expo-router';

export default function TabTwoScreen() {
	return (
		<TView>
			<TText bold size={'xl'}>Explore</TText>
			<TText>
				A second tab ? Amazing !
			</TText>
			<FancyButton mb={'md'} onPress={() => router.push("/members/adamm" as Href)}>
				Go to Adamm's page
			</FancyButton>
			<FancyButton onPress={() => router.push("/members/ferdinand" as Href)}>
				Go to Ferdinand's page
			</FancyButton>
		</TView>
	);
}
