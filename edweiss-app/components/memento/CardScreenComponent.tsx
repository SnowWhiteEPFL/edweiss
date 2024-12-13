/**
 * CardScreenComponent.tsx
 * 
 * @file CardScreenComponent.tsx
 * @description Screen to see a card with a question and an answer
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import ReactComponent from '@/constants/Component';

import { DecksRepository } from '@/app/(app)/courses/[id]/deck/_layout';
import { callFunction } from '@/config/firebase';
import { useRepositoryDocument } from '@/hooks/repository';
import Memento from '@/model/memento';
import { CourseID } from '@/model/school/courses';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import TView from '../core/containers/TView';
import RouteHeader from '../core/header/RouteHeader';
import Icon from '../core/Icon';
import FancyButton from '../input/FancyButton';
import CardDisplayComponent from './CardDisplayComponent';
import CreateDeleteEditCardModal from './CreateDeleteEditCardModal';

// ------------------------------------------------------------
// ---------------- CardScreenComponent Component -------------
// ------------------------------------------------------------

/**
 * Card screen
 * User can see a card with a question and an answer
 * 
 * @param {string} deckId - Deck id
 * @param {number} cardIndex - Card index
 * @param {boolean} isModal - boolean to check if the screen is a modal then change the style
 * @param {React.RefObject<BottomSheetModal>} modalRef - Reference to the modal
 * 
 * @returns {ReactComponent} Screen to see a card
 */
const CardScreenComponent: ReactComponent<{
    courseId: CourseID,
    deckId: string,
    cardIndex: number;
    currentCardIndices: number[]
    setCurrentCardIndices: React.Dispatch<React.SetStateAction<number[]>>
    handleNext: () => void;
}> = ({ courseId, deckId, cardIndex, currentCardIndices, setCurrentCardIndices, handleNext }) => {

    const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility

    const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);

    if (deck == undefined) return;

    const cards = deck.data.cards;
    const card = cards[cardIndex];

    // Delete card
    const deleteCard = async () => {
        handler.modifyDocument(deckId, { cards: cards.filter((_, index) => index != cardIndex) }, (deckId) => {
            callFunction(Memento.Functions.deleteCards, { deckId: deckId, cardIndices: [cardIndex], courseId: courseId });
            console.log(`Card deleted with index ${cardIndex}`);
            const newCardIndices = currentCardIndices.filter((index) => index != cardIndex).map((index) => index > cardIndex ? index - 1 : index);
            setCurrentCardIndices(newCardIndices);
        })
    }

    // Update card
    async function updateCard(new_learning_status: Memento.LearningStatus) {
        if (!card) return;

        handler.modifyDocument(deckId, { cards: cards.map((c, index) => index == cardIndex ? { ...c, learning_status: new_learning_status } : c) }, (deckId) => {
            callFunction(Memento.Functions.updateCard, { deckId: deckId as any, newCard: { ...card, learning_status: new_learning_status }, cardIndex: cardIndex, courseId: courseId });
        });
    }

    return (
        <>
            <RouteHeader
                title='Test Your Might!'
                right={
                    <TTouchableOpacity testID='toggleButton' onPress={() => { setShowDropdown(true); }}>
                        <Icon name='settings' color='darkBlue' size={25} />
                    </TTouchableOpacity>
                }
            />
            <TView style={{ marginTop: '15%' }}>
                <CardDisplayComponent card={card} />
            </TView>

            <TView style={styles.container}>
                {/* Buttons container */}
                <TView style={styles.buttonContainer}>
                    <TView style={styles.buttonHalf}>
                        <FancyButton
                            mx={0}
                            testID='notYetButton'
                            backgroundColor='transparent'
                            textColor='red'
                            onPress={async () => {
                                await updateCard("Not yet");
                                handleNext();
                            }}
                            style={{ width: '100%', height: '100%', borderColor: '#d20f39', borderWidth: 0 }} // Make button fill its half
                            icon='close-sharp'
                        >
                            Not yet
                        </FancyButton>
                    </TView>
                    <TView style={styles.lastButtonHalf}>
                        <FancyButton
                            mx={0}
                            testID='gotItButton'
                            backgroundColor='transparent'
                            textColor='green'
                            onPress={async () => {
                                await updateCard("Got it");
                                handleNext();
                            }}
                            style={{ width: '100%', height: '100%', borderColor: '#40a02b', borderWidth: 0 }} // Make button fill its half
                            icon='checkmark-sharp'
                        >
                            Got it!
                        </FancyButton>
                    </TView>

                </TView>

                {/* Modal */}
                {card && <CreateDeleteEditCardModal
                    courseId={courseId}
                    deckId={deckId}
                    mode='Edit'
                    prev_question={card.question}
                    prev_answer={card.answer}
                    cardIndex={cardIndex}
                    visible={showDropdown}
                    setVisible={setShowDropdown}
                    specialDeleteCard={deleteCard}
                />}

            </TView>
        </>
    );

};

// ------------------------------------------------------------
// ----------------------- Stylesheet -------------------------
// ------------------------------------------------------------

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        marginTop: '10%',
        marginBottom: '20%'
    },
    buttonContainer: {
        position: 'absolute',
        width: '100%', // Keep the row aligned with the card width
        flexDirection: 'row', // Create a horizontal row
        justifyContent: 'space-between',
        borderRadius: 20,
    },
    buttonHalf: {
        flex: 1, // Take up half the width for each button
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: 'gray',
        height: 50, // Set height of the button row
    },
    lastButtonHalf: {
        flex: 1, // Take up half the width for the second button
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    }
});

export default CardScreenComponent;
