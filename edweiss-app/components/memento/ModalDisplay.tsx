/**
 * @file ModalDisplay.tsx
 * @description Component to display the card details in a modal
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import ReactComponent from '@/constants/Component';
import { RepositoryHandler } from '@/hooks/repository';
import Memento from '@/model/memento';
import { CourseID } from '@/model/school/courses';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useState } from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import Icon from '../core/Icon';
import ModalContainer from '../core/modal/ModalContainer';
import TText from '../core/TText';
import CardDisplayComponent from './CardDisplayComponent';
import CreateDeleteEditCardModal from './CreateDeleteEditCardModal';

/**
 * CardModalDisplay
 * Display the card details in a modal
 * 
 * @param {Memento.Card[]} cards - List of cards
 * @param {string} id - Deck id
 * @param {React.RefObject<BottomSheetModalMethods>} modalRef - Reference to the modal
 * @param {Memento.Card | undefined} card - Card to display
 * @param {boolean} isSelectionMode - Selection mode
 * 
 * @returns {ReactComponent} CardModalDisplay component
 */
export const CardModalDisplay: ReactComponent<{
    courseId: CourseID;
    deckId: string;
    handler: RepositoryHandler<Memento.Deck>;
    cards: Memento.Card[];
    id: string,
    modalRef: React.RefObject<BottomSheetModalMethods>;
    card: Memento.Card | undefined;
    isSelectionMode: boolean;
}> = ({ courseId, deckId, cards, modalRef, card, isSelectionMode }) => {
    const [openModal, setOpenModal] = useState(false);

    const absolute_index = cards.indexOf(card as Memento.Card);

    return (
        <>
            <ModalContainer modalRef={modalRef} >
                {card && !isSelectionMode && <>
                    <TView justifyContent='center' alignItems='center' mb='sm'>
                        <TText bold size='lg' mb='sm'>Card details</TText>

                        <TTouchableOpacity
                            testID='edit-card'
                            style={{ position: 'absolute', alignSelf: 'flex-end' }}
                            onPress={() => {
                                modalRef.current?.dismiss();
                                setOpenModal(true);
                            }}
                        >
                            <Icon testID={`status_icon ${absolute_index}`} name={'settings'} color={'darkBlue'} size={'lg'} mr={'lg'} />
                        </TTouchableOpacity>
                    </TView>

                    <CardDisplayComponent card={card} />

                </>
                }
            </ModalContainer >

            {card && <CreateDeleteEditCardModal
                courseId={courseId}
                deckId={deckId}
                mode="Edit"
                prev_question={card.question}
                prev_answer={card.answer}
                cardIndex={absolute_index}
                visible={openModal}
                setVisible={setOpenModal}
            />}
        </>

    );
};