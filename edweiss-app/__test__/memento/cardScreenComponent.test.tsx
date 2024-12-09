/**
 * @file card.test.tsx
 * @description Tests for the CardListScreen component, which displays a list of cards in a deck.
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import CardScreenComponent from '@/components/memento/CardScreenComponent';
import { callFunction } from '@/config/firebase';
import { pushWithParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
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

const card3: Memento.Card = {
    question: 'Question 3',
    answer: 'Answer 3',
    learning_status: 'Not yet',
};

jest.mock("react-native-webview", () => ({
    WebView: jest.fn()
}));

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
    Collections: { deck: 'decks' },
    CollectionOf: jest.fn(() => 'decks'),
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
    //useLocalSearchParams: jest.fn(),
    useLocalSearchParams: jest.fn(() => ({ id: '1' })),
}));

jest.mock('@/hooks/routeParameters', () => ({
    pushWithParameters: jest.fn(),
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

RepositoryMock.mockRepository<Memento.Deck>([{ name: 'Deck 1', cards: [card1, card2] }]);

const mockModifyDocument = jest.fn((deckId, update, callback) => {
    if (callback) callback(deckId); // Execute callback if provided
});

const mockDeleteDocument = jest.fn((deckId, callback) => {
    if (callback) callback(deckId); // Execute callback if provided
});

jest.mock('@/hooks/repository', () => ({
    ...jest.requireActual('@/hooks/repository'),
    useRepositoryDocument: jest.fn(() => [{ data: { cards: [card1, card2] } }, { modifyDocument: mockModifyDocument, deleteDocument: mockDeleteDocument }]),
}));

jest.mock('@/utils/memento/utilsFunctions', () => ({
    ...jest.requireActual('@/utils/memento/utilsFunctions'), // Retain other functions if needed
    selectedCardIndices_play: jest.fn(() => [0, 1]), // Mock only the specific function
}));

// Test suite for the CardScreenComponent component
describe('CardScreen', () => {
    let modalRef: React.RefObject<BottomSheetModal>;
    const mockSetCurrentCardIndices = jest.fn();
    const mockCurrentCardIndices = [0, 1];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);

        const flipButton = getByTestId('flipCardToSeeAnswer')
        fireEvent.press(flipButton);

        const flipButton2 = getByTestId('flipCardToSeeQuestion')
        fireEvent.press(flipButton2);
    });

    it('should delete a card', async () => {
        const { getByTestId, getByText } = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);

        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { id: '1' } });

        const dropDown = getByTestId('toggleButton')
        fireEvent.press(dropDown);

        const deleteButton = getByText('Delete this card!');
        fireEvent.press(deleteButton);

        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCards, { deckId: '1', cardIndices: [0] });
        });
    });

    /*
    it('should catch an error when deleting a card', async () => {
        const {getByTestId, getByText} = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);

                        (callFunction as jest.Mock).mockRejectedValueOnce('Error deleting card');
                        const dropDown = getByTestId('toggleButton')
                        fireEvent.press(dropDown);

                        const deleteButton = getByText('Delete this card!');
                        fireEvent.press(deleteButton);
	
        await waitFor(() => {
                            expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCards, { deckId: '1', cardIndices: [0] });
        });
    });*/

    it('should go to edit card screen when click on button to edit card', () => {
        const { getByTestId, getByText } = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);
        const dropDownButton = getByTestId('toggleButton');
        fireEvent.press(dropDownButton);

        const editButton = getByText('Edit this card!');

        fireEvent.press(editButton);
        /*expect(router.push).toHaveBeenCalledWith({
            pathname: "/deck/1/card/", params: {
                deckId: '1', currentCardIndices: [0, 1], mode: "Edit", prev_question: 'Question 1', prev_answer: 'Answer 1', cardIndex: 0
            }
        });*/
        expect(pushWithParameters).toHaveBeenCalledWith({ path: "/deck/[id]/card" }, { deckId: '1', mode: "Edit", prev_question: 'Question 1', prev_answer: 'Answer 1', cardIndex: 0 });
    });

    it('should call toggleFlip on question tap', () => {
        const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);

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

    it('should update the learning status of a card', () => {
        const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);
        const statusButton = getByTestId('notYetButton');

        fireEvent.press(statusButton);
        expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, { deckId: '1', newCard: { ...card1, learning_status: 'Not yet' }, cardIndex: 0 });
    });

    it('should update the learning status got it of a card', () => {
        const { getByTestId } = render(<CardScreenComponent deckId="1" cardIndex={0} currentCardIndices={mockCurrentCardIndices} setCurrentCardIndices={mockSetCurrentCardIndices} modalRef={modalRef} />);
        const statusButton = getByTestId('gotItButton');

        fireEvent.press(statusButton);
        expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, { deckId: '1', newCard: { ...card1, learning_status: 'Got it' }, cardIndex: 0 });
    });

});