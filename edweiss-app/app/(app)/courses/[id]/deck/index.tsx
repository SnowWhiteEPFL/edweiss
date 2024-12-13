/**
 * Memento App
 * 
 * @file index.tsx
 * @description Implementation of the DeckScreen component, which allows users to create, view, and delete decks of flashcards.
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction, CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useRepository } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { CourseID } from '@/model/school/courses';
import { AppUser } from '@/model/users';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { DecksRepository } from './_layout';

// ------------------------------------------------------------
// ---------------------  DeckScreen Component -----------------
// ------------------------------------------------------------

/**
 * DeckScreen Component that allows users to create, view, and delete decks of flashcards.
 * 
 * @returns {ApplicationRoute} DeckScreen component
 */
const DeckScreen: ApplicationRoute = () => {
	const { id: courseId } = useStringParameters();
	const { uid } = useAuth();

	const [loading, setLoading] = useState(false);

	const [deckName, setDeckName] = useState("");
	const [existedDeckName, setExistedDeckName] = useState(false);
	const [selectedDecks, setSelectedDecks] = useState<Memento.Deck[]>([]);
	const [selectionMode, setSelectionMode] = useState(false); // Track selection mode

	const [decks, handler] = useRepository(DecksRepository);

	const users = useDynamicDocs(CollectionOf<AppUser>('users'));
	if (!users) return undefined;

	async function generateByAI() {
		setLoading(true);
		const res = await callFunction(Memento.Functions.createDeckFromMaterial, {
			courseId,
			materialUrl: "China-101.pdf"
		});

		console.log(res);

		if (res.status == 1) {
			Alert.alert("All good, generated. Check Firebase.");
		} else {
			Alert.alert(`ERROR: ${JSON.stringify(res)}`);
		}

		setLoading(false);
	}

	// For each users, map user.id to user.data.name
	const ids_names_map = new Map<string, string>();
	users.forEach(user => {
		ids_names_map.set(user.id, user.data.name);
	});

	// Create a new deck
	async function call() {
		const trimmedDeckName = deckName.trim();

		if (trimmedDeckName.length == 0 || existedDeckName)
			return;

		const isDuplicate = decks?.some(deck => deck.data.name === trimmedDeckName);
		if (isDuplicate) {
			setExistedDeckName(true);
			return;  // Prevent creation if a duplicate is found
		}

		const deck = {
			ownerID: [uid],
			name: deckName,
			cards: [],
			public: false
		}
		handler.addDocument(deck, callFunction(Memento.Functions.createDeck, { deck, courseId }));
		setDeckName(""); // Clear the input field after successful creation

	}

	// Toggle deck selection
	const toggleDeckSelection = (deck: Memento.Deck) => {
		const index = selectedDecks.findIndex(selected => selected.name === deck.name); // Find index of the selected deck

		setSelectedDecks(prev =>
			index >= 0
				? prev.filter(selected => selected.name !== deck.name) // Remove from selection
				: [...prev, deck] // Add to selection
		);

		// Exit selection mode immediately if all decks are deselected
		if (index >= 0 && selectedDecks.length === 1) {
			setSelectionMode(false);  // Exit selection mode when the last deck is deselected
		}
	};

	// Delete selected decks
	const deleteSelectedDecks = async () => {
		if (selectedDecks.length === 0) return;

		const deckIds = selectedDecks.map(deck => decks?.filter(d => d.data.name === deck.name)[0].id) as string[];

		handler.deleteDocuments(deckIds, (ids) => { callFunction(Memento.Functions.deleteDecks, { deckIds: ids, courseId: courseId }) });

		setSelectedDecks([]); // Clear selection after deletion
		setSelectionMode(false); // Exit selection mode
	};

	const cancelSelection = () => {
		setSelectedDecks([]); // Clear selection
		setSelectionMode(false); // Exit selection mode
	};

	const enterSelectionMode = () => {
		setSelectionMode(true); // Activate selection mode on long press
	};

	return (
		<>
			<RouteHeader title={`${courseId}: Memento`} />

			<TScrollView>

				<FancyButton loading={loading} onPress={generateByAI} backgroundColor='cherry'>
					Generate by AI
				</FancyButton>

				<FancyTextInput
					value={deckName}
					onChangeText={n => {
						setDeckName(n);
						setExistedDeckName(false);
					}}
					placeholder='My amazing deck'
					icon='dice'
					label='Deck name'
					error={existedDeckName ? 'This name has already been used' : undefined}
					multiline
					numberOfLines={3}
				/>

				<FancyButton backgroundColor='blue' mt={'md'} mb={'sm'} onPress={call} icon='logo-firebase'>
					{t("memento:create-deck")}
				</FancyButton>

				{selectedDecks.length > 0 && (
					<TView mt={'md'} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
						<FancyButton
							backgroundColor='red'
							onPress={deleteSelectedDecks}
							mb={'sm'}
							mr={'sm'}
							ml={'md'}
							style={{ flex: 1 }}
							icon='trash'
						>
							Delete
						</FancyButton>

						<FancyButton
							backgroundColor='blue'
							onPress={cancelSelection}
							style={{ flex: 1 }}
							ml={'sm'}
							mr={'md'}
						>
							Cancel
						</FancyButton>
					</TView>
				)}

				{decks?.map((deck) => (
					<DeckDisplay
						key={deck.id}
						deck={deck.data}
						creator={ids_names_map.get(deck.data.ownerID[0]) || 'who is this?'}
						courseId={courseId}
						deckId={deck.id}
						isSelected={selectedDecks.some(selected => selected.name === deck.data.name)}
						toggleSelection={toggleDeckSelection}
						onLongPress={enterSelectionMode}
						selectionMode={selectionMode}
					/>)
				)}
			</TScrollView>
		</>
	);
};

export default DeckScreen;

// ------------------------------------------------------------
// ---------------------  DeckDisplay Component -----------------
// ------------------------------------------------------------

/**
 * Deck Display Component that displays a deck with its name and last modified time.
 * 
 * @param deck: Memento.Deck
 * @param id: deck id
 * @param isSelected: boolean indicating if the deck is selected
 * @param toggleSelection: function to toggle deck selection
 * @param onLongPress: function to handle long press
 * @param selectionMode: boolean indicating if the selection mode is active
 * @returns deck display component
 */
export const DeckDisplay: ReactComponent<{ deck: Memento.Deck, creator: string, courseId: CourseID, deckId: string; isSelected: boolean; toggleSelection: (deck: Memento.Deck) => void; onLongPress: () => void; selectionMode: boolean; }> = ({ deck, creator, courseId, deckId, isSelected, toggleSelection, onLongPress, selectionMode }) => {
	const handlePress = () => {
		if (!selectionMode) {
			router.push(`courses/${courseId}/deck/${deckId}` as any);
		} else {
			toggleSelection(deck);  // Only toggle selection if we're in selection mode
		}
	};

	return (
		<TTouchableOpacity bb={0}
			onLongPress={() => {
				onLongPress();
				toggleSelection(deck);
			}}
			onPress={handlePress}
			m='md' mt={'sm'} mb={'sm'} p='lg'
			backgroundColor={isSelected ? 'peach' : 'base'}
			borderColor='crust' radius='lg'
		>
			<TText bold color={isSelected ? 'crust' : 'text'}>
				{deck.name}
			</TText>
			<TText mb='md' color='subtext0' size={'sm'}>
				Created by: {creator}
			</TText>
		</TTouchableOpacity>
	);
};