/**
 * @file CardListDisplayComponent.tsx
 * @description Visualize each card in a deck
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { DecksRepository } from '@/app/(app)/deck/_layout';
import { callFunction } from '@/config/firebase';
import { useRepositoryDocument } from '@/hooks/repository';
import Memento from '@/model/memento';
import { mementoStatusColorMap, mementoStatusIconMap } from '@/utils/memento/utilsFunctions';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import Icon from '../core/Icon';
import TText from '../core/TText';

/**
 * CardListDisplay
 * 
 * @param {Memento.Card} card - The card to display
 * @param {boolean} isSelected - Whether the card is selected
 * @param {Function} toggleSelection - Function to toggle card selection
 * @param {Function} onLongPress - Function to handle long press
 * @param {boolean} selectionMode - Whether the selection mode is active
 * @param {React.Dispatch<React.SetStateAction<Memento.Card | undefined>>} setCardToDisplay - Function to set the card to display
 * @param {React.RefObject<BottomSheetModalMethods>} modalRef - Reference to the modal
 * 
 * @returns {React.FC} CardListDisplay component 
 */
export const CardListDisplay: React.FC<{
    deckId: string,
    card: Memento.Card,
    isSelected: boolean,
    toggleSelection: (card: Memento.Card) => void,
    onLongPress: () => void,
    selectionMode: boolean,
    setCardToDisplay: React.Dispatch<React.SetStateAction<Memento.Card | undefined>>
    modalRef: React.RefObject<BottomSheetModalMethods>;
}> = ({ deckId, card, isSelected, toggleSelection, onLongPress, selectionMode, setCardToDisplay, modalRef }) => {

    const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);

    async function updateCard(new_status: Memento.LearningStatus) {
        if (deck == undefined)
            return;

        const cardIndex = deck.data.cards.findIndex(c => c.question == card.question);

        const newCards = deck.data.cards;
        newCards[cardIndex] = { ...card, learning_status: new_status };

        handler.modifyDocument(deckId, { cards: newCards }, (deckId) => {
            callFunction(Memento.Functions.updateCard, { deckId, newCard: { ...card, learning_status: new_status }, cardIndex: cardIndex });
        });
    }

    return (
        <TTouchableOpacity bb={5}
            onLongPress={() => {
                onLongPress();
                toggleSelection(card);
            }}
            onPress={() => {
                if (!selectionMode) {
                    setCardToDisplay(card);
                    modalRef.current?.present();
                } else {
                    toggleSelection(card);
                }
            }}
            m='md' mt={'sm'} mb={'sm'} p='lg'
            backgroundColor={isSelected ? 'rosewater' : 'base'}
            borderColor='crust' radius='lg'
        >
            <TView flexDirection='row' justifyContent='space-between'>
                <TView flex={1} mr='md'>
                    <TText bold color='text' ellipsizeMode='tail' numberOfLines={1}>
                        {card.question}
                    </TText>
                    <TText mb='md' color='subtext0' size={'sm'}>
                        2h
                    </TText>
                </TView>

                <TTouchableOpacity
                    onPress={() => updateCard(card.learning_status === "Not yet" ? "Got it" : "Not yet")}
                    activeOpacity={0.2}
                    backgroundColor={'transparent'}
                    borderColor='overlay0'
                    b={'md'} radius={'xl'} pl={'md'} pr={'md'} pt={'md'} pb={'md'}>
                    <Icon testID={`status_icon ${card.question}`} name={mementoStatusIconMap[card.learning_status]} color={mementoStatusColorMap[card.learning_status]} size={'xl'} />
                </TTouchableOpacity>
            </TView>

            {isSelected && <TText color='green'>✓</TText>}
        </TTouchableOpacity>
    );
}
