/**
 * @description Tests for the CardScreenComponent component
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import CardScreenComponent from '@/components/memento/CardScreenComponent';
import Memento from '@/model/memento';
import { ProfessorUser, StudentUser } from '@/model/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { fireEvent, render } from '@testing-library/react-native';
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
}));

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

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));

describe('CardScreenComponent', () => {
    it('should render the card screen', () => {
        const { getByTestId } = render(<CardScreenComponent courseId='course_id' deckId='deck_id' cardIndex={0} currentCardIndices={[0]} setCurrentCardIndices={jest.fn()} handleNext={jest.fn()} />);
        expect(getByTestId('toggleButton')).toBeTruthy();
    });

    it('should delete a card', () => {
        const { getByTestId } = render(<CardScreenComponent courseId='course_id' deckId='deck_id' cardIndex={0} currentCardIndices={[0]} setCurrentCardIndices={jest.fn()} handleNext={jest.fn()} />);
        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const deleteButton = getByTestId('topRightButton');
        fireEvent.press(deleteButton);
    });

    it('should update a card when click on the learning status button', () => {
        const { getByTestId } = render(<CardScreenComponent courseId='course_id' deckId='deck_id' cardIndex={0} currentCardIndices={[0]} setCurrentCardIndices={jest.fn()} handleNext={jest.fn()} />);
        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const gotItButton = getByTestId('gotItButton');
        fireEvent.press(gotItButton);

        const notYetButton = getByTestId('notYetButton');
        fireEvent.press(notYetButton);
    });
});
