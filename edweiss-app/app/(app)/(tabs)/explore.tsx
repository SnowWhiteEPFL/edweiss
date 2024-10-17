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
				<FancyButton onPress={() => {
					router.push({
						pathname: '/(app)/lectures/slides' as any,
						params: {
							courseNameString: "edweiss-demo",
							lectureIdString: "xgy30FeIOHAnKtSfPjAe"
						}

					});
				}} ></FancyButton>
			</TView>
		</>
	);
};

export default ExploreTab;
