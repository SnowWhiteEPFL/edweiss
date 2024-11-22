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

import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import ModalContainer from '@/components/core/modal/ModalContainer';
import FancyButton from '@/components/input/FancyButton';
import CardScreenComponent from '@/components/memento/CardScreenComponent';
import { callFunction } from '@/config/firebase';
import { useRepositoryDocument } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { getStatusColor, handleCardPress, handlePress, sortingCards } from '@/utils/memento/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Redirect, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Button } from 'react-native';
import { DecksRepository } from '../_layout';

/**
 * CardListScreen
 * Display a list of cards in a deck
 * 
 * @returns {ApplicationRoute} Screen to display a list of cards in a deck
 */
const CardListScreen: ApplicationRoute = () => {
	const { id } = useStringParameters();
	const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
	const [selectedCards, setSelectedCards] = useState<Memento.Card[]>([]);
	const [selectionMode, setSelectionMode] = useState(false); // Track selection mode
	const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null); // State to hold selected card index
	const modalRef = useRef<BottomSheetModal>(null); // Reference for the modal

	if (typeof id != 'string')
		return <Redirect href={'/'} />;

	const [deck, handler] = useRepositoryDocument(id, DecksRepository);

	if (deck == undefined)
		return <Redirect href={'/'} />;

	// const decks = useDynamicDocs(Collections.deck);

	// const deck = decks?.find(d => d.id == id);

	const cards = deck.data.cards; // Ensure cards is an array or empty

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
			handler.modifyDocument(id, { cards: cards.filter((_, i) => !selectedCardIndices.includes(i)) }, (id) => {
				callFunction(Memento.Functions.deleteCards, { deckId: id, cardIndices: selectedCardIndices });
			});
			setSelectedCards([]); // Clear selection after deletion
			setSelectionMode(false); // Exit selection mode
		} catch (error) {
			console.error("Error deleting cards:", error);
			// Add user feedback here (e.g., alert or toast notification)
		}
	};


	const cancelCardSelection = () => {
		setSelectedCards([]); // Clear selection
		setSelectionMode(false); // Exit selection mode
	};

	const enterSelectionMode = () => {
		setSelectionMode(true); // Activate selection mode on long press
	};

	// Delete deck
	async function deleteDeck() {
		handler.deleteDocument(id, async (id) => {
			const res = await callFunction(Memento.Functions.deleteDecks, { deckIds: [id] });
			console.log(`Delete res : ${JSON.stringify(res)}`);
			router.back();
		});
	}

	const toggleDropDown = () => { setShowDropdown(prev => !prev); }; // Open/close dropdown

	return (
		<>
			<RouteHeader
				title={deck?.data.name}
				right={
					<Button testID='toggleButton' onPress={toggleDropDown} title='⋮' />
				}
			/>
			{showDropdown && (
				<TView testID='dropDownContent' style={{ position: 'absolute', top: -16, right: 0, padding: 0, zIndex: 1000 }}>
					<FancyButton testID='deleteDeckButton' outlined onPress={deleteDeck} backgroundColor='red' textColor='crust' mt={'md'} mb={'sm'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
						Delete deck
					</FancyButton>
				</TView>
			)}

			{selectedCards.length > 0 && (
				<TView mt={'md'} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<FancyButton
						backgroundColor='red'
						onPress={deleteSelectedCards}
						mb={'sm'}
						style={{ flex: 1 }}
					>
						Delete Selected Cards
					</FancyButton>

					<FancyButton
						backgroundColor='blue'
						onPress={cancelCardSelection}
						style={{ flex: 1 }}
					>
						Cancel
					</FancyButton>
				</TView>
			)}

			< TScrollView >

				<For each={sortedCards}>
					{(card, index) => (
						<DisplayCard
							key={sortedCards.indexOf(card)}
							card={card}
							isSelected={selectedCards.some(selected => selected.question === card.question)}
							toggleSelection={toggleCardSelection}
							onLongPress={enterSelectionMode}
							selectionMode={selectionMode}
							goToPath={() => handleCardPress(index, selectionMode, selectedCardIndex, setSelectedCardIndex, modalRef)}
						/>
					)}
				</For>

			</TScrollView >

			{/* Modal to display the CardScreenComponent */}
			<ModalContainer modalRef={modalRef} snapPoints={['60%', '90%']}>
				{selectedCardIndex !== null &&
					<CardScreenComponent deckId={id} cardIndex={cards.indexOf(sortedCards[selectedCardIndex])} isModal={true} modalRef={modalRef} />
				}

			</ModalContainer >

			{/* Buttons for navigation */}
			< TView >
				<FancyButton testID='playButton' icon='play' onPress={() => router.push({ pathname: `deck/${id}/playingCards` as any })}>
					Go to Playing screen
				</FancyButton>

				<FancyButton mt={'md'} mb={'sm'} ml={'md'} mr={'md'} textColor='crust' onPress={() => router.push({ pathname: `/deck/${id}/card/creation` as any, params: { deckId: id } })} icon='create-outline' >
					Create Card
				</FancyButton>
			</TView >
		</>
	);
};

export default CardListScreen;

/**
 * The DisplayCard component displays a card with the question and learning status
 * 
 * @param Card: Memento.Card 
 * @param isSelected: boolean indicates if the card is selected
 * @param toggleSelection: function to toggle card selection
 * @param onLongPress: function to handle long press
 * @param selectionMode: boolean indicates if the selection mode is active
 * @param goToPath: function to navigate to the handle card press
 * @returns display card component
 */
const DisplayCard: ReactComponent<{ card: Memento.Card, isSelected: boolean, toggleSelection: (card: Memento.Card) => void; onLongPress: () => void; selectionMode: boolean; goToPath: () => void; }> = ({ card, isSelected, toggleSelection, onLongPress, selectionMode, goToPath }) => {
	// Determine the text color based on the learning status
	const statusColor = getStatusColor(card.learning_status ?? "");

	return (
		<TTouchableOpacity bb={5}
			onLongPress={() => {
				onLongPress();
				toggleSelection(card);
			}}
			onPress={() => handlePress(card, selectionMode, goToPath, toggleSelection)}
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
};
