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
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import FancyButton from '@/components/input/FancyButton';
import { CardListDisplay } from '@/components/memento/CardListDisplayComponent';
import { DeleteOptionModalDisplay } from '@/components/memento/DeleteDeckModalAction';
import { CardModalDisplay } from '@/components/memento/ModalDisplay';
import { callFunction } from '@/config/firebase';
import { useRepositoryDocument } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { selectedCardIndices_play, sortingCards } from '@/utils/memento/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Redirect, router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
	const [cardToDisplay, setCardToDisplay] = useState<Memento.Card | undefined>(undefined); // State to hold card to display
	const [isLoading, setIsLoading] = useState(false); // State to track loading status
	const [refresh, setRefresh] = useState(false);
	const modalRef_Card_Info = useRef<BottomSheetModal>(null); // Reference for the modal
	const modalRef_Operation = useRef<BottomSheetModal>(null); // Reference for the modal

	useEffect(() => {
		if (refresh) {
			setRefresh(false)
		}
	}, [refresh]);

	if (typeof id != 'string') return <Redirect href={'/'} />;

	const [deck, handler] = useRepositoryDocument(id, DecksRepository);

	if (deck == undefined)
		return <Redirect href={'/'} />;

	const cards = deck.data.cards;

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
	async function deleteDeck() {
		handler.deleteDocument(id, async (id) => {
			await callFunction(Memento.Functions.deleteDecks, { deckIds: [id] });
			console.log("Deck deleted with id: ", id);
		});
		router.back();
	}

	const handleRefresh = () => {
		setRefresh(true);
	};

	return (
		<>
			<RouteHeader
				title={deck?.data.name}
				right={
					<>
						<TTouchableOpacity
							testID='refreshButton'
							onPress={handleRefresh}
							activeOpacity={0.2}
							backgroundColor={'transparent'}
							mr={'md'}
						>
							<Icon name={'refresh'} size={30} />
						</TTouchableOpacity>

						<TTouchableOpacity
							testID='toggleButton'
							onPress={() => { setShowDropdown(true); modalRef_Operation.current?.present() }}
							activeOpacity={0.2}
							backgroundColor={'transparent'}
						>
							<Icon name={'trash'} size={30} />
						</TTouchableOpacity>

						{/*<Button color={'black'} testID='toggleButton' onPress={() => { setShowDropdown(true); modalRef_Operation.current?.present() }} title='⋮' />*/}
					</>
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

			< TScrollView>
				{sortedCards.map((card) => (
					<CardListDisplay
						key={sortedCards.indexOf(card)}
						deckId={id}
						card={card}
						isSelected={selectedCards.some(selected => selected.question === card.question)}
						toggleSelection={toggleCardSelection}
						onLongPress={enterSelectionMode}
						selectionMode={selectionMode}
						setCardToDisplay={setCardToDisplay}
						modalRef={modalRef_Card_Info}
					/>))}

			</TScrollView >

			<CardModalDisplay handler={handler} cards={cards} id={id} modalRef={modalRef_Card_Info} card={cardToDisplay} isSelectionMode={selectionMode} />

			{/* Buttons for navigation */}
			< TView >
				<FancyButton
					testID='playButton'
					disabled={cards.length === 0}
					backgroundColor={cards.length === 0 ? 'red' : 'blue'}
					icon='play'
					onPress={() => {
						const selectedCardIndices = selectedCardIndices_play(selectedCards, cards);
						cancelCardSelection();
						router.push({
							pathname: `deck/${id}/playingCards` as any,
							params: {
								indices: JSON.stringify(selectedCardIndices)
							}
						})
					}}
				>
					{cards.length === 0 ? "No cards to play" :
						selectedCards.length == 0 ? "Play all cards" : "Play selected cards"}
				</FancyButton>

				<FancyButton
					mt={'md'} mb={'sm'} ml={'md'} mr={'md'}
					textColor='crust'
					onPress={() => {
						setShowDropdown(false);
						//router.push({ pathname: `/deck/${id}/card/creation` as any, params: { deckId: id } })
						router.push({ pathname: `/deck/${id}/card/` as any, params: { deckId: id, mode: "Create", prev_question: "", prev_answer: "", cardIndex: "None" } })
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
