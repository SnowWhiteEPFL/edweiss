import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import HeaderButton from '@/components/core/header/HeaderButton';
import RouteHeader from '@/components/core/header/RouteHeader';
import ModalContainer from '@/components/core/modal/ModalContainer';
import FancyButton from '@/components/input/FancyButton';
import CardScreenComponent from '@/components/memento/CardScreenComponent';
import { callFunction, Collections } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';

const CardListScreen: ApplicationRoute = () => {
	const { id } = useLocalSearchParams();
	const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
	const [selectedCards, setSelectedCards] = useState<Memento.Card[]>([]);
	const [selectionMode, setSelectionMode] = useState(false); // Track selection mode
	const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null); // State to hold selected card index
	const modalRef = useRef<BottomSheetModal>(null); // Reference for the modal
	const decks = useDynamicDocs(Collections.deck);

	if (typeof id != 'string')
		return <Redirect href={'/'} />;

	const deck = decks?.find(d => d.id == id);
	const cards = deck?.data.cards || []; // Ensure cards is an array or empty

	const sortedCards = [...cards].sort((a, b) => {
		if (a.learning_status === "Not yet" && b.learning_status !== "Not yet") return -1;
		if (a.learning_status !== "Not yet" && b.learning_status === "Not yet") return 1;
		return 0;
	});

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

	const deleteSelectedCards = async () => {
		if (selectedCards.length === 0) return;

		try {
			await Promise.all(selectedCards.map(card =>
				callFunction(Memento.Functions.deleteCard, {
					deckId: id,
					cardIndex: cards.indexOf(card)
				})
			));
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


	async function deleteDeck() {

		const res = await callFunction(Memento.Functions.deleteDeck, { deckId: id });

		if (res.status == 1) {
			console.log(`OKAY, deck deleted with id ${res.data.id}`);
			router.back();
		}

	}

	const toggleDropDown = () => { setShowDropdown(prev => !prev); }; // Open/close dropdown

	const handleCardPress = (index: number) => {
		if (!selectionMode) {
			// Open the modal with the selected card
			if (selectedCardIndex === index) {
				// If the card is already selected, close the modal
				modalRef.current?.dismiss(); // You may need to implement dismiss if not provided by BottomSheetModal
				setSelectedCardIndex(null);
			} else {
				setSelectedCardIndex(index); // Set the new selected card index
				modalRef.current?.present(); // Show the modal
			}
		}
	};

	return (
		<>
			<RouteHeader
				title={deck?.data.name}
				right={
					<HeaderButton icon="trash-outline" onPress={toggleDropDown}>
					</HeaderButton>
				}
			/>
			{showDropdown && (
				<TView style={{ position: 'absolute', top: -16, right: 0, padding: 0, zIndex: 1000 }}>
					<FancyButton outlined onPress={deleteDeck} backgroundColor='red' textColor='crust' mt={'md'} mb={'sm'} ml={'md'} mr={'md'} style={{ paddingVertical: 10, paddingHorizontal: 10 }} >
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

				{/*goToPath={() => router.push({ pathname: `deck/${id}/card` as any, params: { deckId: id, cardIndex: cards.indexOf(card) } })}*/}
				<For each={sortedCards}>
					{(card, index) => (
						<DisplayCard
							key={sortedCards.indexOf(card)}
							card={card}
							isSelected={selectedCards.some(selected => selected.question === card.question)}
							toggleSelection={toggleCardSelection}
							onLongPress={enterSelectionMode}
							selectionMode={selectionMode}
							goToPath={() => handleCardPress(index)}
						/>
					)}
				</For>

			</TScrollView >

			{/* Modal to display the CardScreenComponent */}
			<ModalContainer modalRef={modalRef} snapPoints={['50%', '90%']}>
				{selectedCardIndex !== null &&
					<CardScreenComponent deckId={id} cardIndex={cards.indexOf(sortedCards[selectedCardIndex])} isModal={true} />
				}

			</ModalContainer >

			{/* Buttons for navigation */}
			< TView >
				<FancyButton icon='play' onPress={() => router.push({ pathname: `deck/${id}/playingCards` as any })}>
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

const DisplayCard: ReactComponent<{ card: Memento.Card, isSelected: boolean, toggleSelection: (card: Memento.Card) => void; onLongPress: () => void; selectionMode: boolean; goToPath: () => void; }> = ({ card, isSelected, toggleSelection, onLongPress, selectionMode, goToPath }) => {
	// Determine the text color based on the learning status
	const statusColor = getStatusColor(card.learning_status ?? "");

	const handlePress = () => {
		if (!selectionMode) {
			goToPath();
		} else {
			toggleSelection(card); // Select or deselect
		}
	};

	return (
		<TTouchableOpacity bb={5}
			onLongPress={() => {
				onLongPress();
				toggleSelection(card);
			}}
			onPress={handlePress}
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

function getStatusColor(status: string) {
	switch (status) {
		case "Not yet":
			return "red";
		case "Got it":
			return "green";
		default:
			return "black";
	}
}

