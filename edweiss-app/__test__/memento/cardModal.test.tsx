/**
 * @file cardModal.test.tsx
 * @description Test file for the CardModal component
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { CardModalDisplay } from '@/components/memento/ModalDisplay';
import { callFunction } from '@/config/firebase';
import { RepositoryHandler } from '@/hooks/repository';
import { pushWithParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// ------------------------------------------------------------
// ------------------------ Mock Data -------------------------
// ------------------------------------------------------------

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
    learning_status: 'Got it',
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

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { deck: 'decks' }
}));

// Mock Firestore hooks
jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(() => [
        { id: '1', data: { name: 'Deck 1', cards: [card1, card2, card3] } }
    ]),
    useDoc: jest.fn(() => ({ data: { cards: [card1, card2, card3] } })),
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

jest.mock('@/hooks/routeParameters', () => ({
    pushWithParameters: jest.fn(),
}));

// ------------------------------------------------------------
// ------------------------  Test Suite -----------------------
// ------------------------------------------------------------

describe('CardModal', () => {
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
        const { getByText } = render(<CardModalDisplay handler={mockHandler} cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        expect(getByText('Card details')).toBeTruthy();
    });

    it('toggle answer visibility', () => {
        const { getByText, getByTestId } = render(<CardModalDisplay handler={mockHandler} cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const toggleButton = getByTestId('answerReveal');
        expect(toggleButton).toBeTruthy();

        fireEvent.press(toggleButton)
        expect(getByTestId('answerReveal')).toBeTruthy();
    });

    it('delete card', () => {
        const { getByTestId } = render(<CardModalDisplay handler={mockHandler} cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const deleteButton = getByTestId('delete-card');
        expect(deleteButton).toBeTruthy();

        (callFunction as jest.Mock).mockResolvedValue({ status: 1, data: { id: '1' } });

        fireEvent.press(deleteButton)
        expect(callFunction).toHaveBeenCalled();
    });

    it('edit card', () => {
        const { getByTestId } = render(<CardModalDisplay handler={mockHandler} cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const editButton = getByTestId('edit-card');
        expect(editButton).toBeTruthy();

        fireEvent.press(editButton)
        expect(pushWithParameters).toHaveBeenCalledWith({ path: "/deck/[id]/card" }, { deckId: '1', mode: "Edit", prev_question: 'Question 1', prev_answer: 'Answer 1', cardIndex: 0 });

    });
});