import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { router } from 'expo-router';

const ExploreTab: ApplicationRoute = () => {
	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>
				<TText>
					Explore and experiment in explore.tsx !
				</TText>
			</TView>

			<FancyButton mt={10} mb={10} onPress={() => router.push("deck" as any)} backgroundColor='pink'>
				Memento App
			</FancyButton >
		</>
	);
};

export default ExploreTab;
