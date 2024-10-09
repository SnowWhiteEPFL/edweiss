import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import ModalContainer from '@/components/core/modal/ModalContainer';
import FancyButton from '@/components/input/FancyButton';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useRef } from 'react';

const ExploreTab: ApplicationRoute = () => {
	const modalRef = useRef<BottomSheetModal>(null);


	return (
		<>
			<RouteHeader title={"Explore"} />

			<TView>
				<TText>
					Explore and experiment in explore.tsx !
				</TText>
			</TView>

			<FancyButton onPress={() => router.push(`/(app)/todo` as any)}>
				My Todos
			</FancyButton>

			<ModalContainer modalRef={modalRef}>
				<TText>
					Hello, I'm a Modal !
				</TText>
				<FancyButton backgroundColor='red' onPress={() => modalRef.current?.close()}>
					Close modal
				</FancyButton>
			</ModalContainer>
		</>
	);
};

export default ExploreTab;
