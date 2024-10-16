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

			</TView >
		</>
	);
};

export default ExploreTab;
