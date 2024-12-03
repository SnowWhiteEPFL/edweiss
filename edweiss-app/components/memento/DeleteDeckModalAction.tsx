import ReactComponent from '@/constants/Component';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useState } from 'react';
import TView from '../core/containers/TView';
import ModalContainer from '../core/modal/ModalContainer';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';

export const DeleteOptionModalDisplay: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    toggleDropDown: boolean;
    deleteDeck: () => Promise<void>;
}> = ({ modalRef, toggleDropDown, deleteDeck }) => {
    const [isLoading, setIsLoading] = useState(false);

    const deleting = async () => {
        await deleteDeck();
        setIsLoading(false);
    }

    return (
        <ModalContainer modalRef={modalRef} >
            {toggleDropDown && <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>Option</TText>
                </TView>

                <FancyButton
                    loading={isLoading}
                    backgroundColor='red'
                    onPress={() => {
                        setIsLoading(true);
                        deleting();
                    }}
                    style={{ width: '80%', alignSelf: 'center' }}>
                    Delete this deck entirely!
                </FancyButton>
            </>
            }
        </ModalContainer>
    );
};