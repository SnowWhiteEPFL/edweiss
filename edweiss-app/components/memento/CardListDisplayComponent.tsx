/**
 * @file CardListDisplayComponent.tsx
 * @description Visualize each card in a deck
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Memento from '@/model/memento';
import { getStatusColor } from '@/utils/memento/utilsFunctions';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
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
    card: Memento.Card,
    isSelected: boolean,
    toggleSelection: (card: Memento.Card) => void,
    onLongPress: () => void,
    selectionMode: boolean,
    setCardToDisplay: React.Dispatch<React.SetStateAction<Memento.Card | undefined>>
    modalRef: React.RefObject<BottomSheetModalMethods>;
}> = ({ card, isSelected, toggleSelection, onLongPress, selectionMode, setCardToDisplay, modalRef }) => {

    const statusColor = getStatusColor(card.learning_status ?? "");

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
            <TText bold>
                {card.question}
            </TText>
            <TText mb='md' color='subtext0' size={'sm'}>
                2h
            </TText>
            {/* Learning Status Display */}
            <TText style={{
                position: 'absolute',
                top: 25,
                right: 10,
                backgroundColor: 'lightgray',
                padding: 8,
                borderRadius: 5,
                color: statusColor
            }} size={'sm'}>
                {card.learning_status}
            </TText>
            {isSelected && <TText color='green'>✓</TText>}
        </TTouchableOpacity>
    );
}
