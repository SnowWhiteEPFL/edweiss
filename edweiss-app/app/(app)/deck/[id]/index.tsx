/**
 * CardListScreen.tsx
 * Display a list of cards in a deck
 * 
 * @file cardListScreen.tsx
 * @description Screen to display a list of cards in a deck
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { CardListDisplay } from '@/components/memento/CardListDisplayComponent';
import { DeleteOptionModalDisplay } from '@/components/memento/DeleteDeckModalAction';
import { CardModalDisplay } from '@/components/memento/ModalDisplay';
import { callFunction, Collections } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { sortingCards } from '@/utils/memento/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Button } from 'react-native';

/**
 * CardListScreen
 * Display a list of cards in a deck
 * 
 * @returns {ApplicationRoute} Screen to display a list of cards in a deck
 */
const CardListScreen: ApplicationRoute = () => {
	const { id } = useLocalSearchParams();
	const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
	const [selectedCards, setSelectedCards] = useState<Memento.Card[]>([]);
	const [selectionMode, setSelectionMode] = useState(false); // Track selection mode
	const [cardToDisplay, setCardToDisplay] = useState<Memento.Card | undefined>(undefined); // State to hold card to display
	const [isLoading, setIsLoading] = useState(false); // State to track loading status
	const modalRef_Card_Info = useRef<BottomSheetModal>(null); // Reference for the modal
	const modalRef_Operation = useRef<BottomSheetModal>(null); // Reference for the modal
	const decks = useDynamicDocs(Collections.deck);

	if (typeof id != 'string') return <Redirect href={'/'} />;

	const deck = decks?.find(d => d.id == id);
	const cards = deck?.data.cards || []; // Ensure cards is an array or empty

	const sortedCards = sortingCards(cards);

	// Toggle card selection
	const toggleCardSelection = (card: Memento.Card) => {
		const index = selectedCards.findIndex(selected => selected.question === card.question);
		const isAlreadySelected = index !== -1;

		setSelectedCards(prev =>
			isAlreadySelected
				? prev.filter(selected => selected.question !== card.question)
				: [...prev, card]
		);

		if (isAlreadySelected && selectedCards.length === 1) {
			setSelectionMode(false); // Exit selection mode when the last card is deselected
		}
	};

	// Delete selected cards
	const deleteSelectedCards = async () => {
		if (selectedCards.length === 0) return;

		const selectedCardIndices = selectedCards.map(card => cards.indexOf(card));

		try {
			await callFunction(Memento.Functions.deleteCards, { deckId: id, cardIndices: selectedCardIndices });
			setSelectedCards([]); // Clear selection after deletion
			setSelectionMode(false); // Exit selection mode
			setIsLoading(false);
		} catch (error) {
			console.log("Error deleting cards:", error);
			// Add user feedback here (e.g., alert or toast notification)
		}
	};


	const cancelCardSelection = () => {
		setSelectedCards([]); // Clear selection
		setSelectionMode(false); // Exit selection mode
		setIsLoading(false);
	};

	const enterSelectionMode = () => {
		setSelectionMode(true); // Activate selection mode on long press
	};

	// Delete deck
	const deleteDeck = async () => {

		await callFunction(Memento.Functions.deleteDecks, { deckIds: [id] });
		router.back();
	}

	return (
		<>
			<RouteHeader
				title={deck?.data.name}
				right={
					<Button color={'black'} testID='toggleButton' onPress={() => { setShowDropdown(true); modalRef_Operation.current?.present() }} title='⋮' />
				}
			/>

			<DeleteOptionModalDisplay modalRef={modalRef_Operation} toggleDropDown={showDropdown} deleteDeck={deleteDeck} />

			{selectedCards.length > 0 && (
				<TView mt={'md'} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<FancyButton
						backgroundColor='red'
						loading={isLoading}
						onPress={() => {
							setIsLoading(true);
							deleteSelectedCards();
						}}
						mb={'sm'}
						style={{ flex: 1 }}
					>
						Delete Selected Cards
					</FancyButton>

					<FancyButton
						backgroundColor='blue'
						loading={isLoading}
						onPress={() => {
							setIsLoading(true);
							cancelCardSelection();
						}}
						style={{ flex: 1 }}
					>
						Cancel
					</FancyButton>
				</TView>
			)}

			< TScrollView >
				{sortedCards.map((card) => (
					<CardListDisplay
						key={sortedCards.indexOf(card)}
						card={card}
						isSelected={selectedCards.some(selected => selected.question === card.question)}
						toggleSelection={toggleCardSelection}
						onLongPress={enterSelectionMode}
						selectionMode={selectionMode}
						setCardToDisplay={setCardToDisplay}
						modalRef={modalRef_Card_Info}
					/>))}

			</TScrollView >

			<CardModalDisplay cards={cards} id={id} modalRef={modalRef_Card_Info} card={cardToDisplay} isSelectionMode={selectionMode} />

			{/* Buttons for navigation */}
			< TView >
				<FancyButton testID='playButton' icon='play' onPress={() => {
					setShowDropdown(false);
					router.push({ pathname: `deck/${id}/playingCards` as any })
				}}
				>
					{selectedCards.length == 0 ? "Play all cards" : "Play selected cards"}
				</FancyButton>

				<FancyButton
					mt={'md'} mb={'sm'} ml={'md'} mr={'md'}
					textColor='crust'
					onPress={() => {
						setShowDropdown(false);
						router.push({ pathname: `/deck/${id}/card/creation` as any, params: { deckId: id } })
					}}
					icon='create-outline'
				>
					Create Card
				</FancyButton>
			</TView >
		</>
	);
};

export default CardListScreen;
