import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import CardScreenComponent from '@/components/memento/CardScreenComponent';
import { Collections } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { useDoc } from '@/hooks/firebase/firestore';
import { useLocalSearchParams } from 'expo-router';
import React, { forwardRef, useState } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { PanGestureHandler, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';

// Forward ref to TView component and type the ref as a View
const TViewWithRef = forwardRef<View, ViewProps>((props, ref) => (
    <View ref={ref} {...props} />
));

const TestYourMightScreen: ApplicationRoute = () => {
    const { id } = useLocalSearchParams(); // Get deckId from params
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

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
            <RouteHeader title='Test Your Might!'>

            </RouteHeader>

            {cards && cards.length > 0 && (
                <>
                    <TView style={{ position: 'absolute', top: '5%', left: '50%' }}>
                        <TText color='blue' size={20}>
                            {currentCardIndex + 1}/{cards.length}
                        </TText>
                    </TView>
                    <PanGestureHandler onHandlerStateChange={handleGesture}>
                        <TViewWithRef style={{ flex: 1 }}>
                            <CardScreenComponent
                                deckId={id as string}
                                cardIndex={currentCardIndex}
                            />
                        </TViewWithRef>
                    </PanGestureHandler>

                    {/* Add buttons for navigating between cards 
                    <TView style={[styles.buttonExtraContainer]}>
                        <TView style={styles.buttonHalf}>
                            <FancyButton
                                onPress={() => {
                                    handlePrevious();
                                }}
                                style={{ width: '40%', height: '100%', marginRight: '55%' }} // Make button fill its half
                                icon='arrow-back'
                            >

                            </FancyButton>
                        </TView>
                        <TView style={styles.lastButtonHalf}>
                            <FancyButton
                                onPress={() => {
                                    handleNext();
                                }}
                                style={{ width: '40%', height: '100%', marginLeft: '325%' }} // Make button fill its half
                                icon='arrow-forward'
                            >

                            </FancyButton>
                        </TView>
                    </TView>
                    */}
                </>
            )}
        </>
    );
};


export default TestYourMightScreen;

const styles = StyleSheet.create({
    buttonExtraContainer: {
        position: 'absolute',
        bottom: '55%', // Place the row near the bottom
        width: '60%', // Keep the row aligned with the card width
        flexDirection: 'row', // Create a horizontal row
        justifyContent: 'space-between',
        paddingHorizontal: 0,
        borderRadius: 20,
    },
    buttonHalf: {
        flex: 1, // Take up half the width for each button
        justifyContent: 'center',
        alignItems: 'center',
        height: 50, // Set height of the button row
    },
    lastButtonHalf: {
        flex: 1, // Take up half the width for the second button
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
    },
});
