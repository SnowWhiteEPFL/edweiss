/**
 * @description Tests for the shareDeckCard screen
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import ShareScreen from '@/app/(app)/courses/[id]/deck/[deckId]/shareDeckCard';
import { useUser } from '@/contexts/user';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { useStringParameters } from '@/hooks/routeParameters';
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

const TeacherAuthMock2 = {
    id: "tuan_2", data: { type: 'professor', name: 'Test User 2', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['course_id'] } as ProfessorUser,
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

jest.mock('@/hooks/routeParameters', () => ({
    useStringParameters: jest.fn()
}));

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));

// mock useUser()
jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(),
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

describe('Sharing Deck Screen', () => {
    it('should render the sharing screen', async () => {
        const mockUsers = [TeacherAuthMock, TeacherAuthMock2, StudentAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

        (useStringParameters as jest.Mock).mockReturnValue({ id: 'course_id', deckId: '1', type: 'Deck', indices_of_cards_to_share: JSON.stringify([NaN]) });

        (useUser as jest.Mock).mockReturnValue({
            user: { type: 'professor' }, // Mock user data
        });

        const { getByText } = render(<ShareScreen />);
        expect(getByText('Test User 2')).toBeTruthy()
    });

    it('can share a deck with a user with the same type', async () => {
        const { getByText } = render(<ShareScreen />);
        const user2 = getByText('Test User 2');

        fireEvent.press(user2);
    });

    it('can search for a user', async () => {
        const { getByPlaceholderText, getByText } = render(<ShareScreen />);
        const searchInput = getByPlaceholderText('Search for a user');
        fireEvent.changeText(searchInput, 'Test User');
        expect(getByText('Test User 2')).toBeTruthy();
    });
});

describe('Sharing Card Screen', () => {
    it('should render the sharing screen', async () => {
        const mockUsers = [TeacherAuthMock, TeacherAuthMock2, StudentAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

        (useStringParameters as jest.Mock).mockReturnValue({ id: 'course_id', deckId: '1', type: 'Card', indices_of_cards_to_share: JSON.stringify([0]) });

        (useUser as jest.Mock).mockReturnValue({
            user: { type: 'professor' }, // Mock user data
        });

        const { getByText } = render(<ShareScreen />);
        expect(getByText('Test User 2')).toBeTruthy()
    });

    it('can share a card with a user with the same type', async () => {
        const { getByText } = render(<ShareScreen />);
        const user2 = getByText('Test User 2');

        fireEvent.press(user2);
    });
});