import ReactComponent from '@/constants/Component';

import useBottomSheetBackHandler from '@/hooks/useBottomSheetBackHandler';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ReactNode, useCallback } from 'react';

const ModalContainer: ReactComponent<{ snapPoints?: (string | number)[], modalRef: React.RefObject<BottomSheetModalMethods>, children?: ReactNode; }> = (props) => {
	//const backgroundColor = useColor("mantle");
	//const handleIndicatorColor = useColor("base");

	const backgroundColor = 'white';
	const handleIndicatorColor = 'black';

	const { handleSheetPositionChange } = useBottomSheetBackHandler(props.modalRef);

	const renderBackdrop = useBackdrop();

	const snapPoints = props.snapPoints ?? [];

	return (
		<BottomSheetModal
			ref={props.modalRef}
			index={0}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}

			enableDynamicSizing

			enableContentPanningGesture={false}
			handleIndicatorStyle={{ backgroundColor: handleIndicatorColor }}
			backgroundStyle={{ backgroundColor }}
			onChange={handleSheetPositionChange}
		>
			<BottomSheetView>
				{props.children}
			</BottomSheetView>
		</BottomSheetModal>
	);
};

export default ModalContainer;

// export function ModalContainerScrollView(props: { snapPoints?: (string | number)[], modalRef: React.RefObject<BottomSheetModalMethods>, children?: ReactNode }) {
// 	const backgroundColor = useColor("mantle");
// 	const handleIndicatorColor = useColor("base");

// 	const { handleSheetPositionChange } = useBottomSheetBackHandler(props.modalRef);

// 	const renderBackdrop = useBackdrop();

// 	const snapPoints = props.snapPoints == undefined ? [] : props.snapPoints;

// 	return (
// 		<BottomSheetModal
// 			ref={props.modalRef}
// 			index={0}
// 			snapPoints={snapPoints}
// 			backdropComponent={renderBackdrop}

// 			enableContentPanningGesture={false}
// 			enableHandlePanningGesture={false}

// 			handleIndicatorStyle={{ backgroundColor: handleIndicatorColor }}
// 			backgroundStyle={{ backgroundColor }}

// 			onChange={handleSheetPositionChange}
// 		>
// 			<BottomSheetScrollView>
// 				{props.children}
// 			</BottomSheetScrollView>
// 		</BottomSheetModal>
// 	);
// }

const useBackdrop = () => {
	const renderBackdrop = useCallback((props: any) => (
		<BottomSheetBackdrop
			{...props}
			disappearsOnIndex={-1}
			appearsOnIndex={0}
			style={[props.style, { backgroundColor: '#010315' }]}
		/>
	), []);

	return renderBackdrop;
};
