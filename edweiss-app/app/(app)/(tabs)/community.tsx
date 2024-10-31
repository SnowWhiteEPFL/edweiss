import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { ApplicationRoute } from '@/constants/Component';
import { router } from 'expo-router';


const CommunityTab: ApplicationRoute = () => {
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

		</>
	);
};

export default CommunityTab;