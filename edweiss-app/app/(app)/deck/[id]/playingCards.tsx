/**
 * Test Your Might Screen
 * This screen is used to display the cards in a deck in a quiz format.
 * The user can swipe left or right to navigate through the cards.
 * The user can also click on the card to flip it and see the answer.
 * 
 * @file playingCards.tsx
 * @description quiz screen for the user to test their knowledge of the deck
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import CardScreenComponent from '@/components/memento/CardScreenComponent';
import { Collections } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { useDoc } from '@/hooks/firebase/firestore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import React, { forwardRef, useRef, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { PanGestureHandler, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';

// Forward ref to TView component and type the ref as a View
const TViewWithRef = forwardRef<View, ViewProps>((props, ref) => (
    <View ref={ref} {...props} />
));

/**
 * Test Your Might Screen
 * This screen is used to display the cards in a deck in a quiz format.
 * The user can swipe left or right to navigate through the cards.
 * The user can also click on the card to flip it and see the answer.
 * 
 * @returns {ApplicationRoute} Screen to test the user's knowledge of the deck
 */
const TestYourMightScreen: ApplicationRoute = () => {
    const { id } = useLocalSearchParams(); // Get deckId from params
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const modalRef = useRef<BottomSheetModal>(null); // Reference for the modal

    const deck = useDoc(Collections.deck, id as string);
    const cards = deck?.data.cards;

    // Handle next card
    const handleNext = () => {
        if (cards && currentCardIndex < cards.length - 1) {
            setCurrentCardIndex((prevIndex) => prevIndex + 1);
        }
    };

    // Handle previous card
    const handlePrevious = () => {
        if (cards && currentCardIndex > 0) {
            setCurrentCardIndex((prevIndex) => prevIndex - 1);
        }
    };

    // Handle swipe gestures
    const handleGesture = ({ nativeEvent }: PanGestureHandlerStateChangeEvent) => {
        if (nativeEvent.state === State.END) {
            const { translationX } = nativeEvent;

            // Detect swipe left
            if (translationX < -50) {
                handleNext();
            }

            // Detect swipe right
            if (translationX > 50) {
                handlePrevious();
            }
        }
    };

    return (
        <>
            {cards && cards.length > 0 && (
                <>
                    <TView style={{ position: 'absolute', top: '5%', left: '50%' }}>
                        <TText color='blue' size={20}>
                            {currentCardIndex + 1}/{cards.length}
                        </TText>
                    </TView>
                    <PanGestureHandler onHandlerStateChange={handleGesture} testID='pan-gesture'>
                        <TViewWithRef style={{ flex: 1 }}>
                            <CardScreenComponent
                                deckId={id as string}
                                cardIndex={currentCardIndex}
                                modalRef={modalRef}
                            />
                        </TViewWithRef>
                    </PanGestureHandler>

                </>
            )}
        </>
    );
};

export default TestYourMightScreen;
