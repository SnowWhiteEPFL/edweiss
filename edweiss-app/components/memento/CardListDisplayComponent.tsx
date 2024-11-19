import Memento from '@/model/memento';
import { getStatusColor } from '@/utils/memento/utilsFunctions';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import React from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TText from '../core/TText';

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
