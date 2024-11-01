import CardListScreen from '@/app/(app)/deck/[id]';
import TestYourMightScreen from '@/app/(app)/deck/[id]/playingCards';
import RouteHeader from '@/components/core/header/RouteHeader';
import { callFunction } from '@/config/firebase';
import Memento from '@/model/memento';
import { handleCardPress, handlePress, sortingCards } from '@/utils/memento/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Button } from 'react-native';
import { State } from 'react-native-gesture-handler';

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
}));

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

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
    router: { push: jest.fn(), back: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.headerRight()}, {options.headerLeft()}
            </>  // Render the right prop directly for testing
        )),
    },
    useLocalSearchParams: jest.fn(() => ({ id: '1' })),
}));

jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ children }) => (
        <div>{children}</div> // Simple mock
    )),
    BottomSheetView: jest.fn(({ children }) => (
        <div>{children}</div> // Simple mock
    )),
    BottomSheetBackdrop: jest.fn(),
}));

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

        expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCard, { deckId: '1', cardIndex: 1 });
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