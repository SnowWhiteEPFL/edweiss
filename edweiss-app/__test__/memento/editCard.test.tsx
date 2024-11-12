import EditCardScreen from '@/app/(app)/deck/[id]/card/edition';
import { callFunction } from '@/config/firebase';
import Memento from '@/model/memento';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

const card1: Memento.Card = {
    question: 'Question 0',
    answer: 'Answer 0',
    learning_status: 'Got it',
};

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { deck: 'decks' }
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(() => [
        { id: '0', data: { name: 'Deck 0', cards: [card1] } }
    ]),
}));

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
    router: { push: jest.fn(), back: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.headerRight()}, {options.headerLeft()}</>
        )),
    },
    useLocalSearchParams: jest.fn(() => ({ deckId: '0', prev_question: 'Question 0', prev_answer: 'Answer 0', cardIndex: '0' })),
}));

describe('EditCardScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<EditCardScreen />);
        expect(getByText('Question')).toBeTruthy();
        expect(getByText('Answer')).toBeTruthy();
        expect(getByTestId('updateCardButton')).toBeTruthy();
    });

    it('should display the correct previous question and answer', () => {
        const { getByDisplayValue } = render(<EditCardScreen />);
        expect(getByDisplayValue('Question 0')).toBeTruthy();
        expect(getByDisplayValue('Answer 0')).toBeTruthy();
    });

    it('should update a card when the fields are filled', async () => {
        const { getByTestId, getByDisplayValue } = render(<EditCardScreen />);
        const updateButton = getByTestId('updateCardButton');

        fireEvent.changeText(getByDisplayValue('Question 0'), 'Test Question');
        fireEvent.changeText(getByDisplayValue('Answer 0'), 'Test Answer');

        expect(getByDisplayValue('Test Question')).toBeTruthy();

        // Mock successful response for creating a card
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });

        fireEvent.press(updateButton);

        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, {
                deckId: '0',
                newCard: {
                    question: 'Test Question',
                    answer: 'Test Answer',
                    learning_status: 'Got it',
                },
                cardIndex: 0
            });
        });
    });
});
