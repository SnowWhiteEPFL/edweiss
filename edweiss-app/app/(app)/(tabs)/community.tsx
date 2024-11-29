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
					Explore and experiment in community.tsx !
				</TText>
			</TView>

			<FancyButton mt={10} mb={10} onPress={() => router.push("/deck")} backgroundColor='pink'>
				Memento App
			</FancyButton>

			<FancyButton mt={'md'} mb={'md'} onPress={() => router.push(`/(app)/todo`)}>
				My Todos
			</FancyButton>


			{/* Temporary Fix for Accessing the STRC and ST! */}
			<FancyButton mt={10} mb={10} onPress={() => {
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

			<FancyButton mt={10} mb={10} onPress={() => {
				router.push({
					pathname: '/(app)/lectures/slides' as any,
					params: {
						courseNameString: "edweiss-demo",
						lectureIdString: "xgy30FeIOHAnKtSfPjAe"
					}
				});
			}} >
				<TText> Go to ShowTime</TText>
			</FancyButton>


		</>
	);
};

export default CommunityTab;
