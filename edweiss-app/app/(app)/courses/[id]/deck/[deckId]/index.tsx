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
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { CardListDisplay } from '@/components/memento/CardListDisplayComponent';
import CreateDeleteEditCardModal from '@/components/memento/CreateDeleteEditCardModal';
import { CardModalDisplay } from '@/components/memento/ModalDisplay';
import { callFunction, CollectionOf } from '@/config/firebase';
import { iconSizes } from '@/constants/Sizes';
import { useUser } from '@/contexts/user';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useRepository } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { AppUser } from '@/model/users';
import { allowToEditDeck, checkDupplication_EmptyField, selectedCardIndices_play, sortingCards } from '@/utils/memento/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Redirect, router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Modal } from 'react-native';
import { DecksRepository } from '../_layout';

/**
 * CardListScreen
 * Display a list of cards in a deck
 * 
 * @returns {ApplicationRoute} Screen to display a list of cards in a deck
 */
const CardListScreen: ApplicationRoute = () => {
	const { id: courseId, deckId } = useStringParameters();
	const [showDropdown, setShowDropdown] = useState(false); // State for dropdown visibility
	const [selectedCards, setSelectedCards] = useState<Memento.Card[]>([]);
	const [selectionMode, setSelectionMode] = useState(false); // Track selection mode
	const [cardToDisplay, setCardToDisplay] = useState<Memento.Card | undefined>(undefined); // State to hold card to display
	const [name, setName] = useState("");
	const [existedDeckName, setExistedDeckName] = useState(false);
	const [emptyField, setEmptyField] = useState(false);
	const [createCardModalVisible, setCreateCardModalVisible] = useState(false);
	const [loading, setLoading] = useState(false);
	const { user } = useUser();
	const modalRef_Card_Info = useRef<BottomSheetModal>(null); // Reference for the modal

	const users = useDynamicDocs(CollectionOf<AppUser>('users'));
	const [decks, handler] = useRepository(DecksRepository);

	if (typeof deckId != 'string') return <Redirect href={'/'} />;

	if (!users) return null;

	const deck = decks?.find(deck => deck.id === deckId);

	if (deck == undefined)
		return <Redirect href={'/'} />;

	const cards = deck.data.cards;

	const sortedCards = sortingCards(cards);

	const current_user_type = user.type;

	const ids_names_map = new Map<string, string>();
	users.filter(user => user.data.type === "student").forEach(user => {
		ids_names_map.set(user.id, user.data.name);
	});

	const ids_professor_map = new Map<string, string>();
	users.filter(user => user.data.type === "professor").forEach(user => {
		ids_professor_map.set(user.id, user.data.name);
	});

	const users_data_filtered_students = users.filter(user => user.data.type === "student").filter(user => user.data.courses.includes(courseId)).filter(user => user.data.name !== 'Anonymous');

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

		handler.modifyDocument(deckId, { cards: cards.filter((_, i) => !selectedCardIndices.includes(i)) }, (deckId) => {
			callFunction(Memento.Functions.deleteCards, { deckId: deckId, cardIndices: selectedCardIndices, courseId: courseId });
		});
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

	// Delete deck
	async function deleteDeck() {
		handler.deleteDocument(deckId, async (deckId) => {
			await callFunction(Memento.Functions.deleteDecks, { deckIds: [deckId], courseId: courseId });
			console.log("Deck deleted with deckId: ", deckId);
		});
		router.back();
	}

	async function updateDeck(name: string) {
		if (decks == undefined) return;

		if (checkDupplication_EmptyField(
			decks.some(deck => deck.data.name === name),
			name.length == 0,
			setExistedDeckName,
			setEmptyField) == 0
		) return

		handler.modifyDocument(deckId, { name: name }, (deckId) => {
			callFunction(Memento.Functions.updateDeck, { deckId: deckId, name: name, courseId: courseId }); // change edition of public attribute later on
		});
		setShowDropdown(false);
	}

	// Publish deck to all students
	async function publishDeck() {
		if (users_data_filtered_students.length === 0) {
			console.log("No students to share the deck with");
			return;
		}
		setLoading(true);

		const studentsID = users_data_filtered_students.map(user => user.id);

		// Loop through all students and share the deck with them
		studentsID.forEach(async studentId => {
			await callFunction(Memento.Functions.shareDeck, { deckId, other_user: studentId, courseId });
			console.log("Deck shared with student: ", ids_names_map.get(studentId));
		});

		setLoading(false);
	}

	function error_selected() {
		if (existedDeckName) return 'This name has already been used';
		if (emptyField) return 'Please fill in the field';
		return undefined;
	}

	function playingTextSelection() {
		if (cards.length === 0) return "No cards to play"
		if (selectedCards.length == 0) return "Play all cards"
		return "Play selected cards"
	}

	return (
		<>
			<RouteHeader
				title={deck?.data.name}
				right={
					<>
						{current_user_type == 'professor' && <FancyButton backgroundColor='green' outlined loading={loading} onPress={() => {
							publishDeck();
						}}>
							Publish Deck
						</FancyButton>}
						{allowToEditDeck(current_user_type, deck.data.ownerID, ids_professor_map) && <TTouchableOpacity
							testID='toggleButton'
							onPress={() => {
								setName(deck?.data.name as string);
								setShowDropdown(true);
								cancelCardSelection();
							}}
							activeOpacity={0.2}
						>
							<Icon name={'settings'} size={30} />
						</TTouchableOpacity>}
					</>
				}
			/>

			<Modal testID='deckEditModal' visible={showDropdown} animationType='fade' onRequestClose={() => setShowDropdown(false)}>
				<TView flex={1} p={20} backgroundColor='mantle'>
					<TView flexDirection="row" justifyContent="space-between" alignItems="center" mb={'lg'}>
						<TTouchableOpacity testID='closeButton' alignItems="flex-start" onPress={() => { setShowDropdown(false); }}>
							<Icon testID='close_deck_edit_modal' name={'close'} size={iconSizes.lg} color="blue" mr={8} />
						</TTouchableOpacity>

						<TView justifyContent='center' alignItems='center'>
							<TText bold size='lg'>Option</TText>
						</TView>

						<TTouchableOpacity testID='shareButton' onPress={() => {
							setShowDropdown(false);
							router.push({
								pathname: `courses/${courseId}/deck/${deckId}/shareDeckCard` as any,
								params: {
									type: "Deck",
									indices_of_cards_to_share: JSON.stringify([NaN]) // empty array of indices
								}
							});
						}}>
							<Icon name={'share-social'} size={iconSizes.lg} color="blue" mr={8} />
						</TTouchableOpacity>

					</TView>



					<TView my='md' mt={2} borderColor='crust' radius='lg'>
						<FancyTextInput
							value={name}
							onChangeText={n => {
								setName(n)
								setEmptyField(false)
								setExistedDeckName(false)
							}}
							placeholder='Enter the new name of the deck'
							icon='bulb-outline'
							label='Deck Name'
							error={error_selected()}
							multiline
							numberOfLines={3}
						/>
					</TView>

					<FancyButton
						testID='updateDeckButton'
						outlined
						//backgroundColor='transparent'
						backgroundColor='blue'
						onPress={() => {
							updateDeck(name);
						}}
						mt={'md'}
						mb={'md'}
						style={{}}
						icon='checkmark'
					>
						Update Deck Name
					</FancyButton>

					<FancyButton
						outlined
						//backgroundColor='transparent'
						backgroundColor='cherry'
						onPress={() => {
							deleteDeck();
						}}
						style={{}}
						icon='trash'
					>
						Delete this deck entirely!
					</FancyButton>
				</TView>
			</Modal>

			{selectedCards.length > 0 && (
				<TView mt={'md'} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
					<FancyButton
						outlined
						backgroundColor='red'
						onPress={() => {
							deleteSelectedCards();
						}}
						mb={'sm'}
						style={{ flex: 1 }}
						mr={'sm'}
						ml={'md'}
						icon='trash'
					>
						Delete
					</FancyButton>

					<FancyButton
						backgroundColor='green'
						outlined
						testID='shareSelectedCardsButton'
						onPress={() => {
							const selectedCardIndices = selectedCardIndices_play(selectedCards, cards);
							router.push({
								pathname: `courses/${courseId}/deck/${deckId}/shareDeckCard` as any,
								params: {
									type: "Card",
									indices_of_cards_to_share: JSON.stringify(selectedCardIndices)
								}
							});
							cancelCardSelection();
						}}
						mb={'sm'}
						style={{ flex: 1 }}
						mr={'sm'}
						ml={'md'}
						icon='share-social'
					>
						Share
					</FancyButton>

					<FancyButton
						outlined
						backgroundColor='blue'
						onPress={() => {
							cancelCardSelection();
						}}
						style={{ flex: 1 }}
						ml={'sm'}
						mr={'md'}
						icon='close'
					>
						Cancel
					</FancyButton>
				</TView>
			)}

			< TScrollView>
				{sortedCards.map((card) => (
					<CardListDisplay
						key={sortedCards.indexOf(card)}
						courseId={courseId}
						deckId={deckId}
						card={card}
						isSelected={selectedCards.some(selected => selected.question === card.question)}
						toggleSelection={toggleCardSelection}
						onLongPress={enterSelectionMode}
						selectionMode={selectionMode}
						setCardToDisplay={setCardToDisplay}
						modalRef={modalRef_Card_Info}
					/>))}

			</TScrollView >

			<CardModalDisplay courseId={courseId} deckId={deckId} handler={handler} cards={cards} id={deckId} modalRef={modalRef_Card_Info} card={cardToDisplay} isSelectionMode={selectionMode} />

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
							pathname: `courses/${courseId}/deck/${deckId}/playingCards` as any,
							params: {
								indices: JSON.stringify(selectedCardIndices)
							}
						})
					}}
				>
					{playingTextSelection()}
				</FancyButton>

				<FancyButton
					mt={'md'} mb={'sm'} ml={'md'} mr={'md'}
					textColor='crust'
					onPress={() => {
						setCreateCardModalVisible(true);
					}}
					icon='create-outline'
				>
					Create Card
				</FancyButton>
			</TView >

			<CreateDeleteEditCardModal
				courseId={courseId}
				deckId={deckId}
				mode="Create"
				prev_question=""
				prev_answer=""
				cardIndex={NaN}
				visible={createCardModalVisible}
				setVisible={setCreateCardModalVisible}
			/>
		</>
	);
};

export default CardListScreen;
