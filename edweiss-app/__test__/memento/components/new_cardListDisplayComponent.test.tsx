/**
 * @description Tests for the CardListDisplay component
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { CardListDisplay } from '@/components/memento/CardListDisplayComponent';
import Memento from '@/model/memento';
import { ProfessorUser, StudentUser } from '@/model/users';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
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

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));

// mock useUser()
jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(),
}));

describe('CardListDisplay', () => {
    let modalRef: React.RefObject<BottomSheetModal>;
    let mockToggleSelection = jest.fn();

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

    });

    it('should render the CardListDisplay component', () => {
        const { getByTestId } = render(<CardListDisplay courseId="course_id" deckId="deck_id" card={card1} isSelected={false} toggleSelection={jest.fn()} onLongPress={jest.fn()} selectionMode={false} setCardToDisplay={jest.fn()} modalRef={modalRef} />);
        expect(getByTestId('cardQuestionIndex_0')).toBeTruthy();
    });

    it('should update the card status', () => {
        const { getByTestId } = render(<CardListDisplay courseId="course_id" deckId="deck_id" card={card1} isSelected={false} toggleSelection={jest.fn()} onLongPress={jest.fn()} selectionMode={false} setCardToDisplay={jest.fn()} modalRef={modalRef} />);
        const icon = getByTestId('status_icon Question 1');
        expect(icon).toBeTruthy();

        fireEvent.press(icon);
    });

    it('should toggle the card selection', () => {
        const { getByTestId } = render(<CardListDisplay courseId="course_id" deckId="deck_id" card={card1} isSelected={false} toggleSelection={mockToggleSelection} onLongPress={jest.fn()} selectionMode={true} setCardToDisplay={jest.fn()} modalRef={modalRef} />);
        const card = getByTestId('cardQuestionIndex_0');
        fireEvent(card, 'longPress');
        expect(mockToggleSelection).toHaveBeenCalledWith(card1);

        fireEvent(card, 'press');
    });

    it('model ref should be present', () => {
        const { getByTestId } = render(<CardListDisplay courseId="course_id" deckId="deck_id" card={card1} isSelected={false} toggleSelection={jest.fn()} onLongPress={jest.fn()} selectionMode={false} setCardToDisplay={jest.fn()} modalRef={modalRef} />);
        const card = getByTestId('cardQuestionIndex_0');
        fireEvent(card, 'press');
        expect(modalRef.current?.present).toHaveBeenCalled();
    });
});