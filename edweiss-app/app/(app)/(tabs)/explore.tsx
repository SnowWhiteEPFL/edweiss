
import Header from '@/components/core/Header';
import { TText } from '@/components/core/TText';
import { TView } from '@/components/core/containers/TView';

export default function TabTwoScreen() {
	return (
		<>
			<Header title={"Explore"} />

			<TView>
				<TText bold size={'xl'}>Explore</TText>
				<TText>
					Please modify me and experiment with me !
				</TText>
			</TView>
		</>
	);
}
