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
import Memento from '@/model/memento';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
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

// ------------------------------------------------------------
// ------------------------  Test Suite -----------------------
// ------------------------------------------------------------

describe('CardModal', () => {
    const modalRef = React.createRef<BottomSheetModal>();

    it('renders correctly', () => {
        const { getByText } = render(<CardModalDisplay cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        expect(getByText('Card details')).toBeTruthy();
    });

    it('toggle answer visibility', () => {
        const { getByText } = render(<CardModalDisplay cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const toggleButton = getByText('Click to reveal the answer');
        expect(toggleButton).toBeTruthy();

        fireEvent.press(toggleButton)
        expect(getByText('Answer 1')).toBeTruthy();
    });

    it('delete card', () => {
        const { getByTestId } = render(<CardModalDisplay cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const deleteButton = getByTestId('delete-card');
        expect(deleteButton).toBeTruthy();

        (callFunction as jest.Mock).mockResolvedValue({ status: 1, data: { id: '1' } });

        fireEvent.press(deleteButton)
        expect(callFunction).toHaveBeenCalled();
    });

    it('edit card', () => {
        const { getByTestId } = render(<CardModalDisplay cards={[card1, card2, card3]} id='1' modalRef={modalRef} card={card1} isSelectionMode={false} />);
        const editButton = getByTestId('edit-card');
        expect(editButton).toBeTruthy();

        fireEvent.press(editButton)
        expect(router.push).toHaveBeenCalledWith({ pathname: "/deck/1/card/edition", params: { deckId: '1', prev_question: 'Question 1', prev_answer: 'Answer 1', cardIndex: 0 } });

    });
});