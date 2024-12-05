/**
 * @file ModalDisplay.tsx
 * @description Component to display the card details in a modal
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import { RepositoryHandler } from '@/hooks/repository';
import Memento from '@/model/memento';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import ModalContainer from '../core/modal/ModalContainer';
import RichText from '../core/rich-text/RichText';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';

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
    handler: RepositoryHandler<Memento.Deck>;
    cards: Memento.Card[];
    id: string,
    modalRef: React.RefObject<BottomSheetModalMethods>;
    card: Memento.Card | undefined;
    isSelectionMode: boolean;
}> = ({ handler, cards, id, modalRef, card, isSelectionMode }) => {

    const [isAnswerVisible, setIsAnswerVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const absolute_index = cards.indexOf(card as Memento.Card);

    // Reset the visibility state when the card changes
    useEffect(() => {
        setIsAnswerVisible(false);
    }, [card]);

    const handleToggleAnswer = () => {
        setIsAnswerVisible(prevState => !prevState);
    };

    async function deleteCard() {
        if (absolute_index == null) return;

        handler.modifyDocument(id, { cards: cards.filter((_, index) => index !== absolute_index) }, (deckId) => {
            callFunction(Memento.Functions.deleteCards, { deckId: id, cardIndices: [absolute_index] });
            console.log(`Card deleted with index ${absolute_index}`);
            setIsLoading(false);
            modalRef.current?.dismiss();
        });

    }

    return (
        <ModalContainer modalRef={modalRef} >
            {card && !isSelectionMode && <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>Card details</TText>

                    <FancyButton
                        testID='edit-card'
                        loading={isLoading}
                        backgroundColor='transparent'
                        style={{ position: 'absolute', alignSelf: 'flex-end' }}
                        icon='pencil'
                        onPress={() => {
                            modalRef.current?.dismiss();
                            router.push({ pathname: `/deck/${id}/card/edition` as any, params: { deckId: id, prev_question: card?.question, prev_answer: card?.answer, cardIndex: absolute_index } })
                        }}
                    />

                    <FancyButton
                        testID='delete-card'
                        loading={isLoading}
                        backgroundColor='transparent'
                        style={{ position: 'absolute', alignSelf: 'flex-start' }}
                        icon='trash'
                        onPress={() => {
                            setIsLoading(true);
                            deleteCard();
                        }}
                    />
                </TView>

                {/* Box for card.question */}
                <TView m="md" p="md" borderColor="crust" style={{ borderWidth: 1 }} radius="lg" mb="sm">
                    <TText bold mb="sm">Question:</TText>
                    {/*<TText>{card.question}</TText>*/}
                    <RichText>
                        {card.question}
                    </RichText>
                </TView>

                {/* Box for card.answer */}
                <TTouchableOpacity m="md" p="md" borderColor="crust" radius="lg" onPress={handleToggleAnswer}
                    style={{
                        borderWidth: 1,
                        backgroundColor: isAnswerVisible ? 'transparent' : '#f0f0f0', // Dimmed background when blurred
                    }} >

                    <TText bold mb="sm">Answer:</TText>
                    {/*<TText>{isAnswerVisible ? card.answer : 'Click to reveal the answer'}</TText>*/}
                    <RichText>
                        {isAnswerVisible ? card.answer : 'Click to reveal the answer'}
                    </RichText>

                </TTouchableOpacity>

            </>
            }
        </ModalContainer >
    );
};