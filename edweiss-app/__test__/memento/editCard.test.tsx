/**
 * @file editCard.test.tsx
 * @description Unit tests for the EditCardScreen component
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import CreateEditCardScreen from '@/app/(app)/deck/[id]/card';
import { callFunction } from '@/config/firebase';
import { useRepositoryDocument } from '@/hooks/repository';
import Memento from '@/model/memento';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { RepositoryMock } from '../__mocks__/repository';

// ------------------------------------------------------------
// ---------------------  Mock Data & Setup  ------------------
// ------------------------------------------------------------

// Mock card data
const card1: Memento.Card = {
	question: 'Question 0',
	answer: 'Answer 0',
	learning_status: 'Got it',
};

const card2: Memento.Card = {
	question: 'Question 1',
	answer: 'Answer 1',
	learning_status: 'Got it',
};

jest.mock("react-native-webview", () => ({
	WebView: jest.fn()
}));


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
	useLocalSearchParams: jest.fn(() => ({ deckId: '1', mode: 'Edit', prev_question: 'Question 0', prev_answer: 'Answer 0', cardIndex: '0' })),
}));

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
	callFunction: jest.fn(),
	Collections: { deck: 'decks' }
}));

jest.mock('@/hooks/firebase/firestore', () => ({
	useDynamicDocs: jest.fn(() => [
		{ id: '1', data: { name: 'Deck 0', cards: [card1, card2] } }
	]),
}));

RepositoryMock.mockRepository<Memento.Deck>([{
	name: 'Deck 0', cards: [card1, card2]
}]);

const mockModifyDocument = jest.fn((deckId, update, callback) => {
	if (callback) callback(deckId); // Execute callback if provided
});

jest.mock('@/hooks/repository', () => ({
	...jest.requireActual('@/hooks/repository'),
	useRepositoryDocument: jest.fn(() => [{ data: { cards: [card1, card2] } }, { modifyDocument: mockModifyDocument }]),
}));

// ------------------------------------------------------------
// ------------------------ Unit Tests ------------------------
// ------------------------------------------------------------

// Test suite for the EditCardScreen component
describe('EditCardScreen', () => {

	/*
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

	it('should not update a card when the fields are empty', async () => {

		const { getByTestId, getByDisplayValue } = render(<EditCardScreen />);
		const updateButton = getByTestId('updateCardButton');

		// Mock successful response for creating a card
		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });

		fireEvent.changeText(getByDisplayValue('Question 0'), '');
		fireEvent.changeText(getByDisplayValue('Answer 0'), '');

		fireEvent.press(updateButton);

		await waitFor(() => {
			expect(callFunction).not.toHaveBeenCalled();
		});
	});

	it('should not update a card when the question is duplicated', async () => {

		const { getByTestId, getByDisplayValue } = render(<EditCardScreen />);
		const updateButton = getByTestId('updateCardButton');

		// Mock successful response for creating a card
		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });

		fireEvent.changeText(getByDisplayValue('Question 0'), 'Question 5');
		fireEvent.changeText(getByDisplayValue('Answer 0'), 'Test Answer');

		fireEvent.press(updateButton);

		await waitFor(() => {
			expect(callFunction).not.toHaveBeenCalled();
		});
	});
	*/
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render correctly', () => {
		const { getByText, getByTestId } = render(<CreateEditCardScreen />);
		expect(getByText('Question')).toBeTruthy();
		expect(getByText('Answer')).toBeTruthy();
		expect(getByTestId('createCardButton')).toBeTruthy();
	});

	it('should display the correct previous question and answer', () => {
		const { getByDisplayValue } = render(<CreateEditCardScreen />);
		expect(getByDisplayValue('Question 0')).toBeTruthy();
		expect(getByDisplayValue('Answer 0')).toBeTruthy();
	});

	it('should update a card when the fields are filled', async () => {

		// Mock callFunction
		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });

		const { getByTestId, getByDisplayValue } = render(<CreateEditCardScreen />);

		const updateButton = getByTestId('createCardButton');

		// Act: Simulate user input and press update button
		fireEvent.changeText(getByDisplayValue('Question 0'), 'Test Question');
		fireEvent.changeText(getByDisplayValue('Answer 0'), 'Test Answer');

		expect(getByDisplayValue('Test Question')).toBeTruthy();
		expect(getByDisplayValue('Test Answer')).toBeTruthy();

		fireEvent.press(updateButton);

		// Assert: Verify modifyDocument and callFunction are called

		await waitFor(() => {
			expect(mockModifyDocument).toHaveBeenCalledWith(
				'1', // deckId
				{ cards: [{ question: 'Test Question', answer: 'Test Answer', learning_status: 'Got it' }, card2] },
				expect.any(Function)
			);

			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.updateCard, {
				deckId: '1',
				newCard: { question: 'Test Question', answer: 'Test Answer', learning_status: 'Got it' },
				cardIndex: 0,
			});
		});
	});

	it('should not update a card when the fields are empty', async () => {

		const { getByTestId, getByDisplayValue } = render(<CreateEditCardScreen />);
		const updateButton = getByTestId('createCardButton');

		fireEvent.changeText(getByDisplayValue('Question 0'), '');
		fireEvent.changeText(getByDisplayValue('Answer 0'), '');

		fireEvent.press(updateButton);

		// Assert: Verify modifyDocument and callFunction are not called
		await waitFor(() => {
			expect(mockModifyDocument).not.toHaveBeenCalled();
		})
	});

	it('button should be disabled when deck or card is undefined', async () => {

		// Mock useRepositoryDocument to return undefined deck and card
		(useRepositoryDocument as jest.Mock).mockReturnValueOnce([undefined, { modifyDocument: mockModifyDocument }]);

		const { getByTestId } = render(<CreateEditCardScreen />);
		const updateButton = getByTestId('createCardButton');

		fireEvent.press(updateButton);

		await waitFor(() => {
			expect(mockModifyDocument).not.toHaveBeenCalled();
		});
	});

	it('button to preview should preview the card', () => {
		const { getByTestId } = render(<CreateEditCardScreen />);
		const previewButton = getByTestId('previewButton');

		fireEvent.press(previewButton);
		const modalWebView = getByTestId('previewModal');

		expect(modalWebView).toBeTruthy();

		const closeButton = getByTestId('closeButton');
		fireEvent.press(closeButton);
	});

});
