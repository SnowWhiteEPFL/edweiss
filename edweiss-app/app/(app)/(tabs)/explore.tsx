import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';

const ExploreTab: ApplicationRoute = () => {
	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>
				<TText>
					Explore and experiment in explore.tsx !
				</TText>
			</TView>
		</>
	);
};

export default ExploreTab;
