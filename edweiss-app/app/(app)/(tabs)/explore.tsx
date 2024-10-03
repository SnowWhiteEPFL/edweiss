
import TText from '@/components/core/TText';
import Header from '@/components/core/header/Header';
import ModalContainer from '@/components/core/modal/ModalContainer';
import FancyButton from '@/components/input/FancyButton';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRef } from 'react';

export default function TabTwoScreen() {
	const modalRef = useRef<BottomSheetModal>(null);

	return (
		<>
			<Header title={"Explore"} />

			<FancyButton onPress={() => modalRef.current?.present()}>
				Open Modal
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
}
