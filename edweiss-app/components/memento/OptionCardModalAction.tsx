import ReactComponent from '@/constants/Component';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useState } from 'react';
import TView from '../core/containers/TView';
import ModalContainer from '../core/modal/ModalContainer';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';

export const OptionCardModalDisplay: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    toggleDropDown: boolean;
    deleteCard: () => Promise<void>;
    editCard: () => void;
}> = ({ modalRef, toggleDropDown, deleteCard, editCard }) => {
    const [isLoading, setIsLoading] = useState(false);

    const deleting = async () => {
        await deleteCard();
        setIsLoading(false);
    }

    return (
        <ModalContainer modalRef={modalRef} >
            {toggleDropDown && <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>Option</TText>
                </TView>

                <TView mt={'md'} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>

                    <FancyButton
                        loading={isLoading}
                        backgroundColor='red'
                        onPress={() => {
                            setIsLoading(true);
                            deleting();
                        }}
                        mb={'sm'}
                        style={{ flex: 1 }}
                    >
                        Delete this card!
                    </FancyButton>

                    <FancyButton
                        loading={isLoading}
                        backgroundColor='blue'
                        onPress={() => {
                            modalRef.current?.dismiss();
                            editCard();
                        }}
                        style={{ flex: 1 }}>
                        Edit this card!
                    </FancyButton>
                </TView>
            </>
            }
        </ModalContainer>
    );
};