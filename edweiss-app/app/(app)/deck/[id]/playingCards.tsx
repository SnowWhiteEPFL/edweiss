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

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import FancyButton from '@/components/input/FancyButton';
import CardScreenComponent from '@/components/memento/CardScreenComponent';
import { ApplicationRoute } from '@/constants/Component';
import { useRepositoryDocument } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { View, ViewProps } from 'react-native';
import { PanGestureHandler, PanGestureHandlerStateChangeEvent, State } from 'react-native-gesture-handler';
import { DecksRepository } from '../_layout';

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
	const { id, indices } = useStringParameters(); // Get deckId from params
	const [currentCardIndex, setCurrentCardIndex] = useState(0);
	const [currentCardIndices, setCurrentCardIndices] = useState((indices ? JSON.parse(indices) : []) as number[]);
	const modalRef = useRef<BottomSheetModal>(null); // Reference for the modal

	const [deck] = useRepositoryDocument(id, DecksRepository);

	const cards = deck?.data.cards;

	const sanitizedCardIndices = currentCardIndices

	if (sanitizedCardIndices.length === 0) {
		return (
			<TView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
				<TText mb={20}>This is awkward ... It seems like you have no chosen cards to play</TText>
				<FancyButton
					onPress={() => router.back()}
					style={{
						width: '20%', // Adjust to desired button width
						height: 'auto', // Adjust to desired button height
						justifyContent: 'center', // Centers content vertically
						alignItems: 'center', // Centers content horizontally
						borderRadius: 10, // Optional rounded corners
					}}
				>
					Back
				</FancyButton>
			</TView>
		);
	}

	useEffect(() => {
		// Lock the screen orientation to portrait
		ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);

		// Unlock orientation when the component unmounts
		return () => {
			ScreenOrientation.unlockAsync();
		};
	}, []);

	if (cards && currentCardIndex == sanitizedCardIndices.length) {
		setCurrentCardIndex((prevIndex) => prevIndex - 1);
	}

	// Handle next card
	const handleNext = () => {
		if (cards && currentCardIndex < sanitizedCardIndices.length - 1) {
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
							{currentCardIndex + 1}/{sanitizedCardIndices.length}
						</TText>
					</TView>
					<PanGestureHandler onHandlerStateChange={handleGesture} testID='pan-gesture'>
						<TViewWithRef style={{ flex: 1 }}>
							<CardScreenComponent
								deckId={id}
								cardIndex={sanitizedCardIndices[currentCardIndex]}
								currentCardIndices={currentCardIndices}
								setCurrentCardIndices={setCurrentCardIndices}
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
