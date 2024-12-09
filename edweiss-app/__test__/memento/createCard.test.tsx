import CreateEditCardScreen from '@/app/(app)/deck/[id]/card';
import { callFunction } from '@/config/firebase';
import Memento from '@/model/memento';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { RepositoryMock } from '../__mocks__/repository';

// Mock cards
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
    useLocalSearchParams: jest.fn(() => ({ deckId: '1', mode: 'Create', prev_question: '', prev_answer: '', cardIndex: 'None' })),
}));

jest.mock('@/hooks/routeParameters', () => ({
    useRouteParameters: jest.fn(() => ({ deckId: '1', mode: 'Create', prev_question: '', prev_answer: '', cardIndex: 'None' })),
    pushWithParameters: jest.fn(),
}));

RepositoryMock.mockRepository<Memento.Deck>([{ name: 'Deck 1', cards: [card1, card2] }]);

const mockModifyDocument = jest.fn((deckId, update, callback) => {
    if (callback) callback(deckId); // Execute callback if provided
});

jest.mock('@/hooks/repository', () => ({
    ...jest.requireActual('@/hooks/repository'),
    useRepositoryDocument: jest.fn(() => [{ data: { cards: [card1, card2] } }, { modifyDocument: mockModifyDocument }]),
}));

// Test suite for the CreateCardScreen component
describe('CreateCardScreen', () => {
    afterAll(() => {
        jest.clearAllMocks();
    });

    it('should render correctly', () => {
        const { getByText, getByTestId } = render(<CreateEditCardScreen />);
        expect(getByText('Question')).toBeTruthy();
        expect(getByText('Answer')).toBeTruthy();
        expect(getByTestId('createCardButton')).toBeTruthy();
    });

    it('should not create a card when the fields are not filled', async () => {
        const { getByTestId } = render(<CreateEditCardScreen />);
        const createButton = getByTestId('createCardButton');

        fireEvent.press(createButton);
        expect(mockModifyDocument).not.toHaveBeenCalled();
    });

    it('should create a card when the fields are filled', async () => {

        const { getByTestId, getByText } = render(<CreateEditCardScreen />);

        // Mock successful response for creating a card
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { id: '1' } });

        fireEvent.changeText(getByText('Question'), 'Test Question');
        fireEvent.changeText(getByText('Answer'), 'Test Answer');

        const createButton = getByTestId('createCardButton');

        fireEvent.press(createButton);
        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith(Memento.Functions.createCard, {
                deckId: '1',
                card: {
                    question: 'Test Question',
                    answer: 'Test Answer',
                    learning_status: 'Not yet',
                } // Ensure callFunction was called with correct arguments
            });
        });

        expect(router.back).toHaveBeenCalled();
    });

    it('should not create a card when there is a duplicate question', async () => {
        const { getByTestId, getByText } = render(<CreateEditCardScreen />);

        // Mock a duplicate question
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 0 });

        fireEvent.changeText(getByText('Question'), 'Question 1');
        fireEvent.changeText(getByText('Answer'), 'Answer 1');

        const createButton = getByTestId('createCardButton');

        fireEvent.press(createButton);

        await waitFor(() => {
            expect(callFunction).toHaveBeenCalled();
            expect(getByText('Question already existed')).toBeTruthy();
        });
    });
});