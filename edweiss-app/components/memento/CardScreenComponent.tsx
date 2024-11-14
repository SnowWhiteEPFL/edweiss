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

import { callFunction, Collections } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import TView from '../core/containers/TView';
import RouteHeader from '../core/header/RouteHeader';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';

// ------------------------------------------------------------
// ---------------- CardScreenComponent Component ---------------
// ------------------------------------------------------------

/**
 * Card screen
 * User can see a card with a question and an answer
 * 
 * @param {string} deckId - Deck id
 * @param {number} cardIndex - Card index
 * @param {boolean} isModal - boolean to check if the screen is a modal then change the style
 * @returns {ReactComponent} Screen to see a card
 */
const CardScreenComponent: ReactComponent<{ deckId: string, cardIndex: number; isModal?: boolean; }> = ({ deckId, cardIndex, isModal }) => {

    const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
    const [isFlipped, setIsFlipped] = useState(false);

    const decks = useDynamicDocs(Collections.deck);
    const deck = decks?.find(d => d.id == deckId);

    const card = deck?.data.cards[cardIndex];

    const rotation = useSharedValue(0);

    // Reset card flip when changing card
    useEffect(() => {
        setIsFlipped(false);
        rotation.value = 0;
    }, [cardIndex]);

    const toggleDropDown = () => { setShowDropdown(prev => !prev); }; // Open/close dropdown

    // Function to calculate font size based on text length
    const calculateFontSize = (text: string) => {
        const baseSize = 30; // Base font size for short text
        const minSize = 11; // Minimum font size
        const lengthFactor = text.length; // Length factor to reduce font size

        // Calculate font size
        const fontSize = Math.max(minSize, baseSize - (lengthFactor / 18)); // Decrease size as text gets longer
        return fontSize;
    };

    // Flip card animation
    const toggleFlip = () => {
        rotation.value = withTiming(
            isFlipped ? 0 : -180,
            {
                duration: 500,
                easing: Easing.ease
            },
            () => {
                runOnJS(setIsFlipped)(!isFlipped);
            }
        );
    };

    // Animated styles for front and back of the card
    const fronCardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotation.value}deg` }]
        };
    });

    const backCardStyle = useAnimatedStyle(() => {
        return {
            transform: [{ perspective: 1000 }, { rotateY: `${rotation.value + 180}deg` }]
        };
    });

    // Delete card
    async function deleteCard() {

        const res = await callFunction(Memento.Functions.deleteCards, { deckId: deckId, cardIndices: [cardIndex] });
        if (res.status == 1) {
            console.log(`Card deleted with id ${res.data.id}`);
            router.back();
        }

    }

    // Update card
    async function updateCard() {
        try {
            const res = await callFunction(Memento.Functions.updateCard, { deckId: deckId as any, newCard: card, cardIndex: cardIndex });

            if (res.status == 1) {
                console.log(`OKAY, card updated with index ${cardIndex}`);
            }
        } catch (error) {
            console.error("Error deleting card:", error);
        }

    }

    return (
        <TView style={isModal ? styles.modalContainer : styles.container}>
            {!isModal && <RouteHeader
                title='Test Your Might!'
                right={
                    <Button testID='toggleButton' onPress={toggleDropDown} title='⋮' />
                }
            />}

            {isModal && <FancyButton icon='settings-sharp' backgroundColor='transparent' style={{ alignSelf: 'flex-end' }}></FancyButton>}

            {showDropdown && (
                <TView testID='2ButtonsDropDown' borderColor='blue' style={{ position: 'absolute', top: -16, right: 0, padding: 0, zIndex: 1000 }} >
                    <FancyButton testID='deleteCardButton' onPress={deleteCard} backgroundColor='transparent' textColor='red' mt={'md'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
                        Delete Card
                    </FancyButton>
                    <FancyButton testID='editCardButton' onPress={() => router.push({ pathname: `/deck/${deckId}/card/edition` as any, params: { deckId: deckId, prev_question: card?.question, prev_answer: card?.answer, cardIndex: cardIndex } })}
                        backgroundColor='transparent' textColor='teal' mb={'sm'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
                        Edit Card
                    </FancyButton>
                </TView>
            )}

            <TapGestureHandler
                testID='flipCardToSeeAnswer'
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === State.END) {
                        toggleFlip();
                    }
                }}>
                <Animated.View style={[isModal ? styles.modalCard : styles.cardContainer, fronCardStyle]}>
                    <TText mr={10} ml={10} size={20} ellipsizeMode='tail' style={{ textAlign: 'center', fontSize: calculateFontSize(card?.question ?? ""), lineHeight: calculateFontSize(card?.question ?? "") * 1.2 }}>
                        {card?.question}
                    </TText>
                </Animated.View>
            </TapGestureHandler>

            <TapGestureHandler
                testID='flipCardToSeeQuestion'
                onHandlerStateChange={({ nativeEvent }) => {
                    if (nativeEvent.state === State.END) {
                        toggleFlip();
                    }
                }}>
                <Animated.View style={[styles.cardContainer, backCardStyle]}>
                    <TText mr={10} ml={10} size={20} ellipsizeMode='tail' style={{ textAlign: 'center', fontSize: calculateFontSize(card?.answer ?? ""), lineHeight: calculateFontSize(card?.answer ?? "") * 1.2 }}>
                        {card?.answer}
                    </TText>
                </Animated.View>
            </TapGestureHandler>

            {/* Buttons container */}
            <TView style={[styles.buttonContainer]}>
                <TView style={styles.buttonHalf}>
                    <FancyButton
                        testID='notYetButton'
                        backgroundColor='red'
                        onPress={() => updateLearningStatusCard(deckId, cardIndex, updateCard, "Not yet", card)}
                        style={{ width: '100%', height: '100%' }} // Make button fill its half
                        icon='close-sharp'
                    >
                        Not yet
                    </FancyButton>
                </TView>
                <TView style={styles.lastButtonHalf}>
                    <FancyButton
                        testID='gotItButton'
                        backgroundColor='green'
                        onPress={() => updateLearningStatusCard(deckId, cardIndex, updateCard, "Got it", card)}
                        style={{ width: '100%', height: '100%' }} // Make button fill its half
                        icon='checkmark-sharp'
                    >
                        Got it!
                    </FancyButton>
                </TView>
            </TView>

        </TView >
    );

};

// ------------------------------------------------------------
// ----------------------- Stylesheet -------------------------
// ------------------------------------------------------------

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20%'
    },
    modalContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20%',
    },
    modalCard: {
        width: '70%',
        height: '75%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: 'crust',
        backfaceVisibility: 'hidden',
        top: '-2%',
    },
    cardContainer: {
        width: '70%',
        height: '75%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        borderRadius: 20,
        borderColor: 'crust',
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: '10%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '0%', // Place the row near the bottom
        width: '60%', // Keep the row aligned with the card width
        flexDirection: 'row', // Create a horizontal row
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        borderWidth: 1, // Add border to mimic "table" look (optional)
        borderColor: 'transparent', // Border color (optional)
        borderRadius: 20,
    },
    buttonHalf: {
        flex: 1, // Take up half the width for each button
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 5, // Add a border between the two buttons (optional)
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

/**
 * This function updates the learning status of a card
 * 
 * @param deckId: string - deck id 
 * @param cardIndex: number - index of the card 
 * @param onPress: function - function to update the card 
 * @param learning_status: Memento.LearningStatus - new learning status
 * @param card: Memento.Card - current card 
 */
function updateLearningStatusCard(deckId: string, cardIndex: number, onPress: (deckId: any, newCard: Memento.Card, cardIndex: number) => void, learning_status: Memento.LearningStatus, card?: Memento.Card) {
    if (card) {
        card.learning_status = learning_status;
        onPress(deckId, card, cardIndex);
    }
}
