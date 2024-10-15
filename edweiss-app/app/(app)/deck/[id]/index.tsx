import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import HeaderButton from '@/components/core/header/HeaderButton';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, Collections } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';

const CardListScreen: ApplicationRoute = () => {
	const { id } = useLocalSearchParams();
	const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
	const [selectedCards, setSelectedCards] = useState<Memento.Card[]>([]);
	const [selectionMode, setSelectionMode] = useState(false); // Track selection mode


	if (typeof id != 'string')
		return <Redirect href={'/'} />;

	const decks = useDynamicDocs(Collections.deck);
	const deck = decks?.find(d => d.id == id);
	const cards = deck?.data.cards || []; // Ensure cards is an array or empty

	const sortedCards = [...cards].sort((a, b) => {
		if (a.learning_status === "Not yet" && b.learning_status !== "Not yet") return -1;
		if (a.learning_status !== "Not yet" && b.learning_status === "Not yet") return 1;
		return 0;
	});

	const toggleCardSelection = (card: Memento.Card) => {
		const index = selectedCards.findIndex(selected => selected.question === card.question); // Find index of the selected card

		setSelectedCards(prev =>
			prev.some(selected => selected.question === card.question)
				? prev.filter(selected => selected.question !== card.question) // Deselect the card
				: [...prev, card] // Select the card
		);

		// Exit selection mode immediately if all cards are deselected
		if (index >= 0 && selectedCards.length === 1) {
			setSelectionMode(false);  // Exit selection mode when the last deck is deselected
		}
	};

	const deleteSelectedCards = async () => {
		if (selectedCards.length === 0) return;

		// Logic to delete the selected cards
		await Promise.all(selectedCards.map(card =>
			callFunction(Memento.Functions.deleteCard, {
				deckId: id,
				cardIndex: cards.indexOf(card) // Assuming you delete by card index
			})
		));

		setSelectedCards([]); // Clear selection after deletion
		setSelectionMode(false); // Exit selection mode
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

				<For each={sortedCards}>
					{card => (
						<CardDisplay
							key={sortedCards.indexOf(card)}
							card={card}
							isSelected={selectedCards.some(selected => selected.question === card.question)}
							toggleSelection={toggleCardSelection}
							onLongPress={enterSelectionMode}
							selectionMode={selectionMode}
							goToPath={() => router.push({ pathname: `deck/${id}/card` as any, params: { deckId: id, cardIndex: cards.indexOf(card) } })}
						/>
					)}
				</For>

			</TScrollView >

			<TView>
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

const CardDisplay: ReactComponent<{ card: Memento.Card, isSelected: boolean, toggleSelection: (card: Memento.Card) => void; onLongPress: () => void; selectionMode: boolean; goToPath: () => void; }> = ({ card, isSelected, toggleSelection, onLongPress, selectionMode, goToPath }) => {
	// Determine the text color based on the learning status
	const statusColor = card.learning_status === "Not yet" ? 'red' :
		card.learning_status === "Got it" ? 'green' :
			'gray'; // Default color if status is undefined

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

