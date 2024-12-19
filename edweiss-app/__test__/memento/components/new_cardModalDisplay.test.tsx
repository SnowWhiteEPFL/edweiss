/**
 * @description Test file for the CardModalDisplay component
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { CardModalDisplay } from '@/components/memento/ModalDisplay';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { RepositoryHandler } from '@/hooks/repository';
import Memento from '@/model/memento';
import { ProfessorUser, StudentUser } from '@/model/users';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Timestamp } from '@react-native-firebase/firestore';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// ------------------------------------------------------------
// ------------------------ Mock Data -------------------------
// ------------------------------------------------------------

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

const card3: Memento.Card = {
    ownerID: 'tuan',
    question: 'Question 3',
    answer: 'Answer 3',
    learning_status: 'Got it',
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

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
    router: { push: jest.fn(), back: jest.fn() }
}));

// BottomSheet to detect modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    BottomSheetView: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    BottomSheetBackdrop: jest.fn(),
}));

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { deck: `users/tuan/courses/course_id/decks` },
    CollectionOf: jest.fn((path: string) => {
        return path;
    }),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));


describe('CardModalDisplay', () => {
    const mockUsers = [TeacherAuthMock, StudentAuthMock];

    // Mock implementation of useDynamicDocs
    (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

    const modalRef = React.createRef<BottomSheetModal>();

    const mockHandler: RepositoryHandler<Memento.Deck> = {
        modifyDocument: jest.fn((id, data, syncCallback) => {
            if (syncCallback) {
                syncCallback(id);
            }
        }),
        deleteDocument: jest.fn((id, syncCallback) => {
            if (syncCallback) {
                syncCallback(id);
            }
        }),
        addDocument: jest.fn(),
        deleteDocuments: jest.fn(),
    };


    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByText } = render(<CardModalDisplay courseId={'course_id'} deckId='1' handler={mockHandler} cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        expect(getByText('Card details')).toBeTruthy();
    });

    it('can go to edit card modal', () => {
        const { getByTestId } = render(<CardModalDisplay courseId={'course_id'} deckId='1' handler={mockHandler} cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const editCardButton = getByTestId('edit-card');
        fireEvent.press(editCardButton)
    });

});