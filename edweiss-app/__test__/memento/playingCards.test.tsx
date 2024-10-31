import TestYourMightScreen from '@/app/(app)/deck/[id]/playingCards';
import Memento from '@/model/memento';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { State } from 'react-native-gesture-handler';

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
    useLocalSearchParams: jest.fn(() => ({ id: '1' })),
}));

describe('TestYourMightScreen', () => {
    it('should render correctly', () => {
        const { getByText } = render(<TestYourMightScreen />);
        expect(getByText('1/2')).toBeTruthy();
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

    it('should not go out of bounds', () => {
        const { getByTestId, getByText } = render(<TestYourMightScreen />);
        const panGesture = getByTestId('pan-gesture');

        if (panGesture) {
            // Attempt to swipe right on the first card (should stay at 1/2)
            fireEvent(panGesture, 'onHandlerStateChange', {
                nativeEvent: { state: State.END, translationX: 100 },
            });
            expect(getByText('1/2')).toBeTruthy();

            // Swipe to last card
            fireEvent(panGesture, 'onHandlerStateChange', {
                nativeEvent: { state: State.END, translationX: -100 },
            });
            expect(getByText('2/2')).toBeTruthy();

            // Attempt to swipe left on the last card (should stay at 2/2)
            fireEvent(panGesture, 'onHandlerStateChange', {
                nativeEvent: { state: State.END, translationX: -100 },
            });
            expect(getByText('2/2')).toBeTruthy();
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