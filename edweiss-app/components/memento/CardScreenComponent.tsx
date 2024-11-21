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
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Button, StyleSheet } from 'react-native';
import { State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import TView from '../core/containers/TView';
import RouteHeader from '../core/header/RouteHeader';
import TText from '../core/TText';
import FancyButton from '../input/FancyButton';
import { OptionCardModalDisplay } from './OptionCardModalAction';

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
const CardScreenComponent: ReactComponent<{ deckId: string, cardIndex: number; isModal?: boolean; modalRef: React.RefObject<BottomSheetModal> }> = ({ deckId, cardIndex, isModal, modalRef }) => {

    const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const modalRef_Operation = useRef<BottomSheetModal>(null); // Reference for the modal

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
    const deleteCard = async () => {

        const res = await callFunction(Memento.Functions.deleteCards, { deckId: deckId, cardIndices: [cardIndex] });
        if (res.status == 1) {
            console.log(`Card deleted with id ${res.data.id}`);
            //isModal ? modalRef.current?.dismiss() : router.back();
            modalRef_Operation.current?.dismiss();
        }

    }

    const editCard = () => { router.push({ pathname: `/deck/${deckId}/card/edition` as any, params: { deckId: deckId, prev_question: card?.question, prev_answer: card?.answer, cardIndex: cardIndex } }) }

    // Update card
    async function updateCard(new_learning_status: Memento.LearningStatus) {
        if (!card) return;
        try {
            const res = await callFunction(Memento.Functions.updateCard, { deckId: deckId as any, newCard: { ...card, learning_status: new_learning_status }, cardIndex: cardIndex });

            if (res.status == 1) {
                console.log(`OKAY, card updated with index ${cardIndex}`);
            }
        } catch (error) {
            console.log("Error deleting card:", error);
        }

    }

    return (
        <TView style={isModal ? styles.modalContainer : styles.container}>
            {!isModal && <RouteHeader
                title='Test Your Might!'
                right={
                    <Button color={'black'} testID='toggleButton' onPress={() => { setShowDropdown(true); modalRef_Operation.current?.present() }} title='⋮' />
                }
            />}

            {/*showDropdown && (
                <TView testID='2ButtonsDropDown' borderColor='blue' style={{ position: 'absolute', top: -16, right: 0, padding: 0, zIndex: 1000 }} >
                    <FancyButton testID='deleteCardButton' onPress={deleteCard} backgroundColor='transparent' textColor='red' mt={'md'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
                        Delete Card
                    </FancyButton>
                    <FancyButton testID='editCardButton' onPress={() => {
                        if (isModal) { modalRef.current?.dismiss(); }
                        router.push({ pathname: `/deck/${deckId}/card/edition` as any, params: { deckId: deckId, prev_question: card?.question, prev_answer: card?.answer, cardIndex: cardIndex } })
                    }}
                        backgroundColor='transparent' textColor='teal' mb={'sm'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
                        Edit Card
                    </FancyButton>
                </TView>
            )*/}

            <OptionCardModalDisplay modalRef={modalRef_Operation} toggleDropDown={showDropdown} deleteCard={deleteCard} editCard={editCard} />


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
            <TView style={styles.buttonContainer}>
                <TView style={styles.buttonHalf}>
                    <FancyButton
                        testID='notYetButton'
                        loading={isLoading}
                        backgroundColor='red'
                        onPress={async () => {
                            setIsLoading(true);
                            await updateCard("Not yet");
                            setIsLoading(false);
                        }
                        }
                        style={{ width: '100%', height: '100%' }} // Make button fill its half
                        icon='close-sharp'
                    >
                        Not yet
                    </FancyButton>
                </TView>
                <TView style={styles.lastButtonHalf}>
                    <FancyButton
                        loading={isLoading}
                        testID='gotItButton'
                        backgroundColor='green'
                        onPress={async () => {
                            setIsLoading(true);
                            await updateCard("Got it");
                            //await updateLearningStatusCard(deckId, cardIndex, updateCard, "Got it", card);
                            setIsLoading(false);
                        }}
                        style={{ width: '100%', height: '100%' }} // Make button fill its half
                        icon='checkmark-sharp'
                    >
                        Got it!
                    </FancyButton>
                </TView>
                {isModal && <FancyButton icon='settings-sharp' backgroundColor='transparent' style={{ alignSelf: 'flex-end' }} onPress={toggleDropDown} />}

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
        backgroundColor: 'white',
        borderRadius: 20,
        borderColor: 'crust',
        backfaceVisibility: 'hidden',
        position: 'absolute',
        top: '10%',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '-10%', // Place the row near the bottom
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
