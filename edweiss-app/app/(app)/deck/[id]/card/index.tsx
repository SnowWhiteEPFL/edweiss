import RouteHeader from '@/components/core/header/RouteHeader';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import HeaderButton from '@/components/core/header/HeaderButton';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, Collections } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { State, TapGestureHandler } from 'react-native-gesture-handler';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';


const CardScreen: ApplicationRoute = () => {
    const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
    const [isFlipped, setIsFlipped] = useState(false);
    const { deckId, cardIndex } = useLocalSearchParams();

    const decks = useDynamicDocs(Collections.deck);
    const deck = decks?.find(d => d.id == deckId);
    const cardIndexInt = parseInt(cardIndex.toString());

    const card = deck?.data.cards[cardIndexInt];

    const toggleDropDown = () => { setShowDropdown(prev => !prev); }; // Open/close dropdown

    // Function to calculate font size based on text length
    const calculateFontSize = (text: string) => {
        const baseSize = 30; // Base font size for short text
        const minSize = 11; // Minimum font size
        const lengthFactor = text.length; // Length factor to reduce font size

        // Calculate font size
        const fontSize = Math.max(minSize, baseSize - (lengthFactor / 10)); // Decrease size as text gets longer
        return fontSize;
    };

    const rotation = useSharedValue(0);

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

    async function deleteCard() {

        const res = await callFunction(Memento.Functions.deleteCard, { deckId: deckId as any, cardIndex: cardIndexInt });

        if (res.status == 1) {
            console.log(`OKAY, card deleted with id ${res.data.id}`);
            router.back();
        }

    }

    async function updateCard() {

        const res = await callFunction(Memento.Functions.updateCard, { deckId: deckId as any, newCard: card, cardIndex: cardIndexInt });

        if (res.status == 1) {
            console.log(`OKAY, card updated with index ${cardIndexInt}`);
        }

    }

    return (
        <>
            <RouteHeader
                title='Card Screenj'
                right={
                    <HeaderButton icon="ellipsis-vertical-outline" onPress={toggleDropDown}>
                    </HeaderButton>
                }
            />
            {showDropdown && (
                <TView borderColor='blue' style={{ position: 'absolute', top: -16, right: 0, padding: 0, zIndex: 1000 }} >
                    <FancyButton onPress={deleteCard} backgroundColor='transparent' textColor='red' mt={'md'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
                        Delete Card
                    </FancyButton>
                    <FancyButton onPress={() => router.push({ pathname: `/deck/${deckId}/card/edition` as any, params: { deckId: deckId, prev_question: card?.question, prev_answer: card?.answer, cardIndex: cardIndex } })}
                        backgroundColor='transparent' textColor='teal' mb={'sm'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
                        Edit Card
                    </FancyButton>
                </TView>
            )}

            <TView style={styles.container}>

                <TapGestureHandler
                    onHandlerStateChange={({ nativeEvent }) => {
                        if (nativeEvent.state === State.END) {
                            toggleFlip();
                        }
                    }}>
                    <Animated.View style={[styles.cardContainer, fronCardStyle]}>
                        <TText mr={10} ml={10} size={20} ellipsizeMode='tail' style={{ textAlign: 'center', fontSize: calculateFontSize(card?.question ?? ""), lineHeight: calculateFontSize(card?.question ?? "") * 1.2 }}>
                            {card?.question}
                        </TText>
                    </Animated.View>
                </TapGestureHandler>

                <TapGestureHandler
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

                {/* 
                <TTouchableOpacity onPress={toggleAnswer} bb={5} style={{ width: '70%', height: '40%' }} backgroundColor='base' borderColor='crust' radius='lg' justifyContent='center' alignItems='center' >

                    <TText mr={10} ml={10} size={20} ellipsizeMode='tail' style={{ textAlign: 'center', fontSize: calculateFontSize(showAnswer ? card?.answer ?? "" : card?.question ?? ""), lineHeight: calculateFontSize(showAnswer ? card?.answer ?? "" : card?.question ?? "") * 1.2 }}>
                        {showAnswer ? card?.answer : card?.question}
                    </TText>

                </TTouchableOpacity >
                */}

                {/* Buttons container */}
                <TView style={[styles.buttonContainer]}>
                    <TView style={styles.buttonHalf}>
                        <FancyButton
                            backgroundColor='red'
                            onPress={() => updateLearningStatusCard(deckId as any, cardIndexInt, updateCard, "Not yet", card)}
                            style={{ width: '100%', height: '100%' }} // Make button fill its half
                            icon='close-sharp'
                        >
                            Not yet
                        </FancyButton>
                    </TView>
                    <TView style={styles.lastButtonHalf}>
                        <FancyButton
                            backgroundColor='green'
                            onPress={() => updateLearningStatusCard(deckId as any, cardIndexInt, updateCard, "Got it", card)}
                            style={{ width: '100%', height: '100%' }} // Make button fill its half
                            icon='checkmark-sharp'
                        >
                            Got it!
                        </FancyButton>
                    </TView>
                </TView>


            </TView >
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: '20%'
    },
    cardContainer: {
        width: '70%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 30,
        borderColor: 'crust',
        backfaceVisibility: 'hidden',
        position: 'absolute'
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '15%', // Place the row near the bottom
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

export default CardScreen;

function updateLearningStatusCard(deckId: string, cardIndex: number, onPress: (deckId: any, newCard: Memento.Card, cardIndex: number) => void, learning_status: Memento.LearningStatus, card?: Memento.Card) {
    if (card) {
        card.learning_status = learning_status;
        onPress(deckId, card, cardIndex);
    }
}

