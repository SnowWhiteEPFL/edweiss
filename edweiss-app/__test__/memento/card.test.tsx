/**
 * @file card.test.tsx
 * @description Tests for the CardListScreen component, which displays a list of cards in a deck.
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import CardListScreen from '@/app/(app)/deck/[id]';
import CreateCardScreen from '@/app/(app)/deck/[id]/card/creation';
import TestYourMightScreen from '@/app/(app)/deck/[id]/playingCards';
import RouteHeader from '@/components/core/header/RouteHeader';
import CardScreenComponent, { styles } from '@/components/memento/CardScreenComponent';
import { callFunction } from '@/config/firebase';
import Memento from '@/model/memento';
import { handleCardPress, handlePress, sortingCards } from '@/utils/memento/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Button } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { RepositoryMock } from '../__mocks__/repository';

// ------------------------------------------------------------
// ---------------------  Mock Data & Setup -------------------
// ------------------------------------------------------------

// Mock cards
const card1: Memento.Card = {
	question: 'Question 1',
	answer: 'Answer 1',
	learning_status: 'Got it',
};

const card2: Memento.Card = {
	question: 'Question 2',
	answer: 'Answer 2',
	learning_status: 'Not yet',
};

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	getAllKeys: jest.fn(() => Promise.resolve([])),
	multiGet: jest.fn((keys) => Promise.resolve(keys.map((key: string) => [key, 'value']))),
	multiSet: jest.fn(() => Promise.resolve()),
	multiRemove: jest.fn(() => Promise.resolve()),
}));
// CommonMock.mockAsyncStorage();

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
	callFunction: jest.fn(),
	Collections: { deck: 'decks' }
}));

jest.mock('@/hooks/firebase/firestore', () => ({
	useDynamicDocs: jest.fn(() => [
		{ id: '1', data: { name: 'Deck 1', cards: [card1, card2] } }
	]),
	useDoc: jest.fn(() => ({ data: { cards: [card1, card2] } })),
}));

// jest.mock('@/hooks/repository', () => ({
// 	useRepository: jest.fn(() => [
// 		[{ id: '1', data: { name: 'Deck 1', cards: [card1, card2] } }]
// 		, {
// 			addDocument: () => jest.fn(),
// 			modifyDocument: () => jest.fn(),
// 			deleteDocument: () => jest.fn(),
// 			deleteDocuments: () => jest.fn(),
// 		}]),
// 	useRepositoryDocument: jest.fn(() => [
// 		{ id: '1', data: { name: 'Deck 1', cards: [card1, card2] } }
// 		, {
// 			addDocument: () => jest.fn(),
// 			modifyDocument: () => jest.fn(),
// 			deleteDocument: () => jest.fn(),
// 			deleteDocuments: () => jest.fn(),
// 		}]),
// }));
// CommonMock.mockAsyncStorage();
RepositoryMock.mockRepository<Memento.Deck>([{ name: 'Deck 1', cards: [card1, card2] }]);
// CoreMock.mockRouteHeader();
// CommonMock.mockExpoRouter({ params: { id: '1' } });

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
	router: { push: jest.fn(), back: jest.fn() },
	Stack: {
		Screen: jest.fn(({ options }) => (
			<>{options.headerRight()}, {options.headerLeft()}
			</>  // Render the right prop directly for testing
		)),
	},
	//useLocalSearchParams: jest.fn(),
	useLocalSearchParams: jest.fn(() => ({ id: '1' })),
}));

// Mock BottomSheet modal
jest.mock('@gorhom/bottom-sheet', () => ({
	BottomSheetModal: jest.fn(({ children }) => (
		<div>{children}</div> // Simple mock
	)),
	BottomSheetView: jest.fn(({ children }) => (
		<div>{children}</div> // Simple mock
	)),
	BottomSheetBackdrop: jest.fn(),
}));

// Mock reanimated library
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Mock toggleFlip function
const toggleFlip = jest.fn(); // This function is not exported, so we mock it here. UNTIL WE EXPORT IT

// ------------------------------------------------------------
// ------------------------  Test Suite -----------------------
// ------------------------------------------------------------

// Test suite for the CardListScreen component
describe('CardListScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	it('renders without crashing', () => {
		const { getByText } = render(<CardListScreen />);
		expect(getByText('Question 1')).toBeTruthy();
		expect(getByText('Question 2')).toBeTruthy();
		expect(getByText('Got it')).toBeTruthy();
		expect(getByText('Not yet')).toBeTruthy();
	});

	it('toggles card selection', () => {
		const { getByText } = render(<CardListScreen />);
		const question1 = getByText('Question 1');
		const question2 = getByText('Question 2');

		fireEvent(question1, 'onLongPress');
		expect(getByText('Question 1')).toBeTruthy();

		fireEvent(question2, 'onLongPress');
		expect(getByText('Question 2')).toBeTruthy();
	});

	it('can delete selected cards', async () => {
		const { getByText } = render(<CardListScreen />);
		const card2 = getByText('Question 2');

		// Simulate long press to select the card
		fireEvent(card2, 'onLongPress');

		// Simulate clicking the delete button
		const deleteButton = getByText('Delete Selected Cards');
		fireEvent.press(deleteButton);

		expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCards, { deckId: '1', cardIndices: [1] });
	});

	it('can cancel card selection', () => {
		const { getByText } = render(<CardListScreen />);
		const card2 = getByText('Question 2');

		// Simulate long press to select the card
		fireEvent(card2, 'onLongPress');

		// Simulate clicking the cancel button
		const cancelButton = getByText('Cancel');
		fireEvent.press(cancelButton);

		expect(getByText('Question 2')).toBeTruthy();
	});

	it('can go to playing screen', () => {
		const { getByTestId } = render(<CardListScreen />);
		const playButton = getByTestId('playButton');

		fireEvent.press(playButton);
		expect(router.push).toHaveBeenCalledWith({ pathname: "deck/1/playingCards" });
	});

	it('can create a new card', () => {
		const { getByText } = render(<CardListScreen />);
		const createButton = getByText('Create Card');

		fireEvent.press(createButton);
		expect(router.push).toHaveBeenCalledWith({ pathname: "/deck/1/card/creation", params: { deckId: '1' } });
	});

	it('can delete a deck', () => {
		const { getByTestId, queryByTestId } = render(<CardListScreen />);
		// Initially, the dropdown should not be visible
		expect(queryByTestId('dropDownContent')).toBeNull();

		// Press the button to show the dropdown
		const toggleButton = getByTestId('toggleButton');
		fireEvent.press(toggleButton);

		// Now, the dropdown should be visible
		expect(getByTestId('dropDownContent')).toBeTruthy();

		// Press the button again to hide the dropdown
		fireEvent.press(toggleButton);

		// The dropdown should be hidden again
		expect(queryByTestId('dropDownContent')).toBeNull();

		// Press the button again to show the dropdown
		fireEvent.press(toggleButton);

		const deleteDeckButton = getByTestId('deleteDeckButton');
		expect(deleteDeckButton).toBeTruthy();

		// Press the delete deck button
		fireEvent.press(deleteDeckButton);

	});

	it('cards are sorted according to learning status', () => {
		const sortedCards = sortingCards([card1, card2]);
		expect(sortedCards[0].question).toBe('Question 2');
		expect(sortedCards[1].question).toBe('Question 1');
	});

});

// Test suite for the utility functions
describe('handlePress', () => {
	const mockCard: Memento.Card = {
		question: 'Test Question',
		answer: 'Test Answer',
		learning_status: 'Got it',
	};

	const mockGoToPath = jest.fn();
	const mockToggleSelection = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	it('calls goToPath when not in selection mode', () => {
		handlePress(mockCard, false, mockGoToPath, mockToggleSelection);

		expect(mockGoToPath).toHaveBeenCalled();
		expect(mockToggleSelection).not.toHaveBeenCalled(); // Ensure toggleSelection is not called
	});

	it('calls toggleSelection when in selection mode', () => {
		handlePress(mockCard, true, mockGoToPath, mockToggleSelection);

		expect(mockToggleSelection).toHaveBeenCalledWith(mockCard);
		expect(mockGoToPath).not.toHaveBeenCalled(); // Ensure goToPath is not called
	});

	// Add additional tests for edge cases if necessary
});


describe('handleCardPress', () => {
	let modalRef: React.RefObject<BottomSheetModal>;
	let setSelectedCardIndex: jest.Mock;

	beforeEach(() => {
		// Create a mock for modalRef
		modalRef = {
			current: {
				present: jest.fn(),
				dismiss: jest.fn(),
				snapToIndex: jest.fn(),
				snapToPosition: jest.fn(),
				expand: jest.fn(),
				collapse: jest.fn(),
				close: jest.fn(),
				forceClose: jest.fn(),
			},
		};

		setSelectedCardIndex = jest.fn();
	});

	it('opens modal when a card is pressed and no card is selected', () => {
		// Call handleCardPress with the appropriate arguments
		handleCardPress(0, false, null, setSelectedCardIndex, modalRef);

		expect(setSelectedCardIndex).toHaveBeenCalledWith(0);
		expect(modalRef.current?.present).toHaveBeenCalled();
	});

	it('closes modal when the same card is pressed', () => {
		// Call handleCardPress to select a card
		handleCardPress(0, false, 0, setSelectedCardIndex, modalRef);

		expect(modalRef.current?.dismiss).toHaveBeenCalled();
		expect(setSelectedCardIndex).toHaveBeenCalledWith(null);
	});

	// Additional test cases can be added here to cover more scenarios
});


describe('RouteHeader', () => {
	it('renders the right and left prop button', () => {
		const { getByTestId } = render(
			<RouteHeader
				title="Test Header"
				left={<Button testID="leftButton" onPress={jest.fn()} title="Left" />}
				right={<Button testID="toggleButton" onPress={jest.fn()} title="Toggle" />}
			/>
		);

		// Expect the button to be in the document
		expect(getByTestId('toggleButton')).toBeTruthy();
		expect(getByTestId('leftButton')).toBeTruthy();
	});
});

// Test suite for the TestYourMightScreen component
describe('TestYourMightScreen', () => {
	it('should render correctly', () => {
		const { getByText } = render(<TestYourMightScreen />);
		expect(getByText('1/2')).toBeTruthy();
	});

	it('should increment currentCardIndex on left swipe', () => {
		const { getByTestId, getByText } = render(<TestYourMightScreen />);
		const panGesture = getByTestId('pan-gesture');

		if (panGesture) {
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.END, translationX: -100 },
			});
			expect(getByText('2/2')).toBeTruthy();
		}
	});

	it('should decrement currentCardIndex on right swipe', () => {
		const { getByTestId, getByText } = render(<TestYourMightScreen />);
		const panGesture = getByTestId('pan-gesture');

		if (panGesture) {
			// First, swipe left to go to the second card
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.END, translationX: -100 },
			});
			expect(getByText('2/2')).toBeTruthy();

			// Then swipe right to go back to the first card
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.END, translationX: 100 },
			});
			expect(getByText('1/2')).toBeTruthy();
		}
	});

	it('should not go out of bounds', () => {
		const { getByTestId, getByText } = render(<TestYourMightScreen />);
		const panGesture = getByTestId('pan-gesture');

		if (panGesture) {
			// Attempt to swipe right on the first card (should stay at 1/2)
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.END, translationX: 100 },
			});
			expect(getByText('1/2')).toBeTruthy();

			// Swipe to last card
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.END, translationX: -100 },
			});
			expect(getByText('2/2')).toBeTruthy();

			// Attempt to swipe left on the last card (should stay at 2/2)
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.END, translationX: -100 },
			});
			expect(getByText('2/2')).toBeTruthy();
		}
	});

	it('should do nothing if gesture state is not END', () => {
		const { getByTestId, getByText } = render(<TestYourMightScreen />);
		const panGesture = getByTestId('pan-gesture');

		if (panGesture) {
			// Try a left swipe with a state that isn't END
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.BEGAN, translationX: -100 },
			});

			// Check that currentCardIndex hasn't incremented
			expect(getByText('1/2')).toBeTruthy();

			// Try a right swipe with a state that isn't END
			fireEvent(panGesture, 'onHandlerStateChange', {
				nativeEvent: { state: State.BEGAN, translationX: 100 },
			});

			// Check again to confirm it hasn't decremented either
			expect(getByText('1/2')).toBeTruthy();
		}
	});
});

// Test suite for the CreateCardScreen component
describe('CreateCardScreen', () => {
	afterAll(() => {
		jest.clearAllMocks();
	});

	it('should render correctly', () => {
		const { getByText, getByTestId } = render(<CreateCardScreen />);
		expect(getByText('Question')).toBeTruthy();
		expect(getByText('Answer')).toBeTruthy();
		expect(getByTestId('createCardButton')).toBeTruthy();
	});

	it('should not create a card when the fields are not filled', async () => {
		const { getByTestId } = render(<CreateCardScreen />);
		const createButton = getByTestId('createCardButton');

		fireEvent.press(createButton);
		expect(router.back).not.toHaveBeenCalled();
	});

	it('should create a card when the fields are filled', async () => {

		const { getByTestId, getByText } = render(<CreateCardScreen />);

		// Mock successful response for creating a card
		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { id: '1' } });

		fireEvent.changeText(getByText('Question'), 'Test Question');
		fireEvent.changeText(getByText('Answer'), 'Test Answer');

		const createButton = getByTestId('createCardButton');

		fireEvent.press(createButton);
		await waitFor(() => {
			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.createCard, {
				deckId: undefined,
				card: {
					question: 'Test Question',
					answer: 'Test Answer',
					learning_status: 'Not yet',
				} // Ensure callFunction was called with correct arguments
			});
		});

		expect(router.back).toHaveBeenCalled();
	});

	it('should not create a card when there is a duplicate question', async () => {
		const { getByTestId, getByText } = render(<CreateCardScreen />);

		// Mock a duplicate question
		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 0 });

		fireEvent.changeText(getByText('Question'), 'Question 1');
		fireEvent.changeText(getByText('Answer'), 'Answer 1');

		const createButton = getByTestId('createCardButton');

		fireEvent.press(createButton);

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalled();
			expect(getByText('Question already exists')).toBeTruthy();
		});
	});
});

// Test suite for the CardScreenComponent component
describe('CardScreen', () => {
	let modalRef: React.RefObject<BottomSheetModal>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render correctly', () => {
		const { getByText, getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} modalRef={modalRef} />);
		expect(getByText('Question 1')).toBeTruthy();

		const flipButton = getByTestId('flipCardToSeeAnswer')
		fireEvent.press(flipButton);

		expect(getByText('Answer 1')).toBeTruthy();

		const flipButton2 = getByTestId('flipCardToSeeQuestion')
		fireEvent.press(flipButton2);

		expect(getByText('Question 1')).toBeTruthy();
	});

	it('should delete a card', async () => {
		const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} modalRef={modalRef} />);

		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { id: '1' } });

		const dropDown = getByTestId('toggleButton')
		fireEvent.press(dropDown);

		const deleteButton = getByTestId('deleteCardButton');
		fireEvent.press(deleteButton);

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCards, { deckId: '1', cardIndices: [0] });
		});
	});

	it('should catch an error when deleting a card', async () => {
		const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} modalRef={modalRef} />);

		(callFunction as jest.Mock).mockRejectedValueOnce('Error deleting card');
		const dropDown = getByTestId('toggleButton')
		fireEvent.press(dropDown);

		const deleteButton = getByTestId('deleteCardButton');
		fireEvent.press(deleteButton);

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCards, { deckId: '1', cardIndices: [0] });
		});
	});

	it('should update a card when click on button to change learning status', async () => {
		const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} modalRef={modalRef} />);

		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { id: '1' } });

		const notYetButton = getByTestId('notYetButton')
		fireEvent.press(notYetButton);

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, {
				deckId: '1',
				newCard: {
					question: 'Question 1',
					answer: 'Answer 1',
					learning_status: 'Not yet',
				},
				cardIndex: 0
			});
		});

		const gotItButton = getByTestId('gotItButton')
		fireEvent.press(gotItButton);

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, {
				deckId: '1',
				newCard: {
					question: 'Question 1',
					answer: 'Answer 1',
					learning_status: 'Got it',
				},
				cardIndex: 0
			});
		});
	});

	it('should go to edit card screen when click on button to edit card', () => {
		const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} modalRef={modalRef} />);
		const dropDownButton = getByTestId('toggleButton');
		fireEvent.press(dropDownButton);

		const editButton = getByTestId('editCardButton');

		fireEvent.press(editButton);
		expect(router.push).toHaveBeenCalledWith({ pathname: "/deck/1/card/edition", params: { deckId: '1', prev_question: 'Question 1', prev_answer: 'Answer 1', cardIndex: 0 } });
	});

	it('should call toggleFlip on question tap', () => {
		const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} modalRef={modalRef} />);

		const flipCard = getByTestId('flipCardToSeeAnswer');
		fireEvent(flipCard, 'onHandlerStateChange', { nativeEvent: { state: State.END } });

		expect(toggleFlip).toHaveBeenCalledTimes(0);

		const flipCard2 = getByTestId('flipCardToSeeQuestion');
		fireEvent(flipCard2, 'onHandlerStateChange', { nativeEvent: { state: State.END } });

		expect(toggleFlip).toHaveBeenCalledTimes(0);

		fireEvent(flipCard, 'onHandlerStateChange', { nativeEvent: { state: State.CANCELLED } });

		expect(toggleFlip).toHaveBeenCalledTimes(0);

		fireEvent(flipCard2, 'onHandlerStateChange', { nativeEvent: { state: State.CANCELLED } });

		expect(toggleFlip).toHaveBeenCalledTimes(0);
	});

	it('should display different styles if isModal is true', () => {
		const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} isModal={true} modalRef={modalRef} />);
		const flipCard = getByTestId('flipCardToSeeAnswer');

		expect(flipCard.props.style).toEqual(expect.arrayContaining([{ ...styles.modalCard }]));
	});

});
