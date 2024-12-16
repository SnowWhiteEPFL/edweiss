/**
 * @file card.test.tsx
 * @description Tests for the CardListScreen component, which displays a list of cards in a deck.
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import CardListScreen from '@/app/(app)/courses/[id]/deck/[deckId]';
import { callFunction } from '@/config/firebase';
import { useUser } from '@/contexts/user';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { ProfessorUser, StudentUser } from '@/model/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// ------------------------------------------------------------
// ---------------------  Mock Data & Setup -------------------
// ------------------------------------------------------------

// Mock cards
const card1: Memento.Card = {
    ownerID: 'tuan',
    question: 'Question 1',
    answer: 'Answer 1',
    learning_status: 'Got it',
};

const card2: Memento.Card = {
    ownerID: 'tuan',
    question: 'Question 2',
    answer: 'Answer 2',
    learning_status: 'Not yet',
};

const TeacherAuthMock = {
    id: "tuan", data: { type: 'professor', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['course_id'] } as ProfessorUser,
};

const StudentAuthMock = {
    id: "tuan_1", data: { type: 'student', name: 'Test User student', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['course_id'] } as StudentUser,
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
    Collections: { deck: `users/tuan/courses/course_id/decks` },
    CollectionOf: jest.fn((path: string) => {
        return path;
    }),
}));

jest.mock('@react-native-firebase/firestore', () => {
    // Mock the onSnapshot method
    const mockOnSnapshot = jest.fn((callback) => {
        // Ensure callback is a function before calling it
        if (typeof callback === 'function') {
            // Simulate calling the callback with mock document data
            callback({
                exists: true,
                data: () => ({ field: 'value' }),
            });
        }
        // Return a mock unsubscribe function
        return jest.fn();
    });

    // Ensure firestore is mocked as both a function and an object with methods
    return {
        __esModule: true,
        onSnapshot: mockOnSnapshot, // Mock onSnapshot separately in case needed
    };
});

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
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
    Redirect: jest.fn(),
}));

jest.mock('@/hooks/routeParameters', () => ({
    useStringParameters: jest.fn(() => ({ id: 'course_id', deckId: '1' }))
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

const mockModifyDocument = jest.fn((deckId, update, callback) => {
    if (callback) callback(deckId); // Execute callback if provided
});

const mockDeleteDocument = jest.fn((deckId, callback) => {
    if (callback) callback(deckId); // Execute callback if provided
});

jest.mock('@/hooks/repository', () => ({
    ...jest.requireActual('@/hooks/repository'),
    useRepository: jest.fn(() => [[{ id: '1', data: { ownerID: ['tuan'], name: 'Deck 1', cards: [card1, card2] } }], { modifyDocument: mockModifyDocument, deleteDocument: mockDeleteDocument }]),
    useRepositoryDocument: jest.fn(() => [{ id: '1', data: { ownerID: ['tuan'], name: 'Deck 1', cards: [card1, card2] } }, { modifyDocument: mockModifyDocument, deleteDocument: mockDeleteDocument }]),
}));

jest.mock('@/utils/memento/utilsFunctions', () => ({
    ...jest.requireActual('@/utils/memento/utilsFunctions'), // Retain other functions if needed
    selectedCardIndices_play: jest.fn(() => [0, 1]), // Mock only the specific function
}));

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));

// mock useUser()
jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(),
}));


describe('CardListScreen', () => {
    it('renders without crashing', () => {
        const mockUsers = [TeacherAuthMock, StudentAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

        (useUser as jest.Mock).mockReturnValue({
            user: { type: 'professor' }, // Mock user data
        });

        const { getByTestId } = render(<CardListScreen />);
        expect(getByTestId('cardQuestionIndex_0')).toBeTruthy();
    });

    it('toggles card selection', () => {
        const { getByText, getByTestId } = render(<CardListScreen />);
        const question1 = getByTestId('cardQuestionIndex_0');
        const question2 = getByTestId('cardQuestionIndex_1');

        fireEvent(question1, 'onLongPress');
        expect(question1).toBeTruthy();

        fireEvent.press(question2);
        expect(question2).toBeTruthy();

        fireEvent.press(question1);
        fireEvent.press(question2);
    });

    it('can delete selected cards', async () => {
        const { getByText, getByTestId } = render(<CardListScreen />);
        const card2 = getByTestId('cardQuestionIndex_1');

        // Simulate long press to select the card
        fireEvent(card2, 'onLongPress');

        // Simulate clicking the delete button
        const deleteButton = getByText('Delete');
        fireEvent.press(deleteButton);

        expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteCards, { courseId: "course_id", deckId: '1', cardIndices: [1] });
    });

    it('can cancel card selection', () => {
        const { getByText, getByTestId } = render(<CardListScreen />);
        const card2 = getByTestId('cardQuestionIndex_1');

        // Simulate long press to select the card
        fireEvent(card2, 'onLongPress');

        // Simulate clicking the cancel button
        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);

        expect(getByTestId('cardQuestionIndex_1')).toBeTruthy();
    });

    it('can go to playing screen', () => {
        const { getByTestId } = render(<CardListScreen />);
        const playButton = getByTestId('playButton');

        fireEvent.press(playButton);
        expect(router.push).toHaveBeenCalledWith({
            pathname: "courses/course_id/deck/1/playingCards",
            params: {
                indices: JSON.stringify([0, 1])
            }
        });
    });

    it('A modal appears to create card', () => {
        const { getByText, getByTestId } = render(<CardListScreen />);
        const createButton = getByText('Create Card');

        fireEvent.press(createButton);
        const create_modal = getByTestId('Create_modal');
        expect(create_modal).toBeTruthy();
    });

    it('can delete a deck', () => {
        const { getByText, getByTestId } = render(<CardListScreen />);

        // Press the button to show the dropdown
        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const deleteDeckButton = getByText('Delete this deck entirely!');

        // Now, the modal should be visible
        expect(deleteDeckButton).toBeTruthy();

        // Press the delete deck button
        fireEvent.press(deleteDeckButton);
    });

    it('can update the learning status of a card', async () => {
        const { getByTestId } = render(<CardListScreen />);
        const learning_status_icon = getByTestId('status_icon Question 1');
        expect(learning_status_icon).toBeTruthy();

        fireEvent.press(learning_status_icon);
        expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, { deckId: '1', newCard: { ...card1, learning_status: 'Not yet' }, cardIndex: 0, courseId: 'course_id' });
    });

    it('can update the deck name', async () => {
        const { getByText, getByTestId } = render(<CardListScreen />);
        const toggleButton = getByTestId('toggleButton');

        fireEvent.press(toggleButton);

        const deck_name_field = getByText('Deck Name');
        fireEvent.changeText(deck_name_field, 'New Deck Name');

        const update_button = getByTestId('updateDeckButton')
        fireEvent.press(update_button);

        expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateDeck, { deckId: '1', name: 'New Deck Name', courseId: 'course_id' });
    });

    it('cannot update the deck name if the field is empty', async () => {
        const { getByText, getByTestId } = render(<CardListScreen />);
        const toggleButton = getByTestId('toggleButton');

        fireEvent.press(toggleButton);

        const deck_name_field = getByText('Deck Name');
        fireEvent.changeText(deck_name_field, '');

        const update_button = getByTestId('updateDeckButton')
        fireEvent.press(update_button);
    });

    it('professor can publish the deck', async () => {
        const { getByText } = render(<CardListScreen />);

        const publish_button = getByText('Publish Deck');
        fireEvent.press(publish_button);
    });

    it('can close the edit deck modal', async () => {
        const { getByTestId } = render(<CardListScreen />);

        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const closeDeckEditModalButton = getByTestId('close_deck_edit_modal');
        fireEvent.press(closeDeckEditModalButton);
    });

    it('can close the edit deck modal via on request close', async () => {
        const { getByTestId } = render(<CardListScreen />);

        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const deckEditModal = getByTestId('deckEditModal');
        fireEvent(deckEditModal, 'onRequestClose');
    });

    it('can go to share screen', () => {
        const { getByTestId } = render(<CardListScreen />);

        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const shareButton = getByTestId('shareButton');

        fireEvent.press(shareButton);
        expect(router.push).toHaveBeenCalledWith({
            pathname: "courses/course_id/deck/1/shareDeckCard",
            params: {
                type: "Deck",
                indices_of_cards_to_share: JSON.stringify([NaN]) // empty array of indices
            }
        });
    });

    it('can go to share screen for selected cards', () => {
        const { getByTestId, getByText } = render(<CardListScreen />);

        const card2 = getByTestId('cardQuestionIndex_1');

        // Simulate long press to select the card
        fireEvent(card2, 'onLongPress');

        const cancelButton = getByText('Cancel');
        fireEvent.press(cancelButton);

        fireEvent(card2, 'onLongPress');

        const shareCardButton = getByTestId('shareSelectedCardsButton');
        fireEvent.press(shareCardButton);
    });

    it('professor cannot publish the deck if there is no student', async () => {

        const mockUsers = [TeacherAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

        const { getByText } = render(<CardListScreen />);

        const publish_button = getByText('Publish Deck');
        fireEvent.press(publish_button);
    });

    it('go to Redirect if deck is not found', () => {

        (useStringParameters as jest.Mock).mockReturnValue({ id: 'course_id', deckId: '400' });

        const { getByText } = render(<CardListScreen />);
    });

});