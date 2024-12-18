/**
 * @description Tests for the playingCards screen
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TestYourMightScreen from '@/app/(app)/courses/[id]/deck/[deckId]/playingCards';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { ProfessorUser, StudentUser } from '@/model/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { State } from 'react-native-gesture-handler';

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

jest.mock('@/hooks/routeParameters', () => ({
    //useStringParameters: jest.fn(() => ({ id: 'course_id', deckId: '1', indices: JSON.stringify([0, 1]) })),
    useStringParameters: jest.fn()
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

// mock useUser()
jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(),
}));

describe('TestYourMightScreen', () => {

    it('should render correctly when no indices are given', () => {
        (useStringParameters as jest.Mock).mockReturnValue({ id: 'course_id', deckId: '1', indices: JSON.stringify([]) });

        const { getByText } = render(<TestYourMightScreen />);
        expect(getByText('This is awkward ... It seems like you have no chosen cards to play')).toBeTruthy();
        const backButton = getByText('Back');
        fireEvent.press(backButton);

        expect(router.back).toHaveBeenCalled();
    });

    it('should render the TestYourMightScreen component', () => {
        (useStringParameters as jest.Mock).mockReturnValue({ id: 'course_id', deckId: '1', indices: JSON.stringify([0, 1]) });

        const { getByTestId } = render(<TestYourMightScreen />);
        expect(getByTestId('question_view')).toBeTruthy();
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

    it('current card index should decrement if it is equal to number of sanitized indices', () => {
        const { getByTestId, getByText } = render(<TestYourMightScreen />);
        const panGesture = getByTestId('pan-gesture');

        if (panGesture) {
            fireEvent(panGesture, 'onHandlerStateChange', {
                nativeEvent: { state: State.END, translationX: -100 },
            });
            expect(getByText('2/2')).toBeTruthy();
        }

        const toggleButton = getByTestId('toggleButton');
        fireEvent.press(toggleButton);

        const deleteCardButton = getByTestId('topRightButton')
        expect(deleteCardButton).toBeTruthy();

        fireEvent.press(deleteCardButton);
        expect(getByText('1/1')).toBeTruthy();

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

