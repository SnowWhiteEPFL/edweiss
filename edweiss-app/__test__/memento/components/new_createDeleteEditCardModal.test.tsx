/**
 * @description Tests for the CreateDeleteEditCardModal component
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import CreateDeleteEditCardModal from '@/components/memento/CreateDeleteEditCardModal';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
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

// mock useUser()
jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(),
}));

describe('CreateDeleteEditCardModal', () => {
    it('should render correctly', () => {
        const mockUsers = [TeacherAuthMock, StudentAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

        const { getByTestId, getByText } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="Question 1"
                prev_answer="Answer 1"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        expect(getByText('Option')).toBeTruthy();
    });

    it('can edit a card', () => {

        const { getByTestId, getByText, getByDisplayValue } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="Question 1"
                prev_answer="Answer 1"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        const question_field = getByDisplayValue('Question 1');
        expect(question_field).toBeTruthy();

        fireEvent.changeText(question_field, 'New Question');

        const answer_field = getByDisplayValue('Answer 1');
        expect(answer_field).toBeTruthy();

        fireEvent.changeText(answer_field, 'New Answer');

        const editCardButton = getByTestId('EditCardButton');
        expect(editCardButton).toBeTruthy();

        fireEvent.press(editCardButton);
    });

    it('can still edit the card even if the question is the same', () => {
        const { getByTestId, getByText, getByDisplayValue } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="Question 1"
                prev_answer="Answer 1"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        const editCardButton = getByTestId('EditCardButton');
        expect(editCardButton).toBeTruthy();

        fireEvent.press(editCardButton);
    });

    it('cannot edit a card with empty question', () => {
        const { getByTestId, getByText } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question=""
                prev_answer=""
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        const editCardButton = getByTestId('EditCardButton');

        fireEvent.press(editCardButton);
    });

    it('can create a card', () => {
        const { getByTestId, getByText } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Create"
                prev_question="New Question"
                prev_answer="New Answer"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        const createCardButton = getByTestId('CreateCardButton');

        fireEvent.press(createCardButton);
    });

    it('cannot create a card with empty question', () => {
        const { getByTestId, getByText } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Create"
                prev_question=""
                prev_answer="New Answer"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        const createCardButton = getByTestId('CreateCardButton');

        fireEvent.press(createCardButton);
    });

    it('can delete a card', () => {
        const { getByTestId, getByText } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="New Question"
                prev_answer="New Answer"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()} />);

        const deleteCardButton = getByTestId('topRightButton');

        fireEvent.press(deleteCardButton);
    });

    it('modal closes when close button is pressed', () => {
        const setVisible = jest.fn();
        const { getByTestId } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="New Question"
                prev_answer="New Answer"
                cardIndex={0}
                visible={true}
                setVisible={setVisible} />);

        const closeButton = getByTestId('closeButton');

        fireEvent.press(closeButton);
        expect(setVisible).toHaveBeenCalled();
    });

    it('modal closes when user presses on the go back button on their phone', () => {
        const setVisible = jest.fn();
        const { getByTestId } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="New Question"
                prev_answer="New Answer"
                cardIndex={0}
                visible={true}
                setVisible={setVisible} />);

        const modal = getByTestId('Edit_modal');
        fireEvent(modal, 'onRequestClose');
        expect(setVisible).toHaveBeenCalled();
    });

    it('modal can call specialDeleteCard', () => {
        const specialDeleteCard = jest.fn();
        const { getByTestId } =
            render(<CreateDeleteEditCardModal
                courseId="course_id"
                deckId="deck_id"
                mode="Edit"
                prev_question="New Question"
                prev_answer="New Answer"
                cardIndex={0}
                visible={true}
                setVisible={jest.fn()}
                specialDeleteCard={specialDeleteCard} />);

        const deleteCardButton = getByTestId('topRightButton');

        fireEvent.press(deleteCardButton);
        expect(specialDeleteCard).toHaveBeenCalled();
    });
});