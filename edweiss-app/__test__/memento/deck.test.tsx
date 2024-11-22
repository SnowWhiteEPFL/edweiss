/**
 * @file deck.test.tsx
 * @description Unit tests for the DeckScreen and DeckDisplay components in the Memento module
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import Memento from '@/model/memento';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import 'react-native';
import DeckScreen, { DeckDisplay } from '../../app/(app)/deck/index';
import { RepositoryMock } from '../__mocks__/repository';

// ------------------------------------------------------------
// ---------------------  Mocks & Setups  ---------------------
// ------------------------------------------------------------

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

RepositoryMock.mockRepository<Memento.Deck>([{
	name: 'Deck 1', cards: []
}]);

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
	callFunction: jest.fn(),
	Collections: { deck: 'decks' }
}));

jest.mock('@/hooks/firebase/firestore', () => ({
	useDynamicDocs: jest.fn(() => [
		{ id: '1', data: { name: 'Deck 1', cards: [] } }
	])
}));

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
	router: { push: jest.fn() },
	Stack: {
		Screen: jest.fn(({ options }) => (
			<>{options.title}</> // Simulate rendering the title for the test
		)),
	},
}));

// ------------------------------------------------------------
// ------------------------  Tests  ---------------------------
// ------------------------------------------------------------

// Test cases for the DeckScreen component
describe('DeckScreen', () => {
	beforeEach(() => {
		jest.clearAllMocks(); // Clear previous mocks before each test
	});

	it('renders without crashing', () => {
		const { getByText } = render(<DeckScreen />);
		expect(getByText('Deck 1')).toBeTruthy();
	});

	it('allows the user to input a deck name', () => {
		const { getByPlaceholderText } = render(<DeckScreen />);
		const input = getByPlaceholderText('My amazing deck');
		fireEvent.changeText(input, 'New Deck');
		expect(input.props.value).toBe('New Deck');
	});

	it('displays an error message when trying to create a deck with an existing name', async () => {
		const { getByPlaceholderText, getByText } = render(<DeckScreen />);
		const input = getByPlaceholderText('My amazing deck');
		fireEvent.changeText(input, 'Deck 1'); // Use existing deck name
		fireEvent.press(getByText('Create Deck')); // Press the button to create the deck
		expect(getByText('This name has already been used')).toBeTruthy();
	});

	it('navigates to the deck details when a deck is pressed', () => {
		const { getByText } = render(<DeckScreen />);
		fireEvent.press(getByText('Deck 1'));
		expect(router.push).toHaveBeenCalledWith('/deck/1');
	});

	it('allows selecting and deleting decks', async () => {
		const { getByText } = render(<DeckScreen />);

		// Long press to select Deck 1
		fireEvent(getByText('Deck 1'), 'longPress');

		// Click delete button
		fireEvent.press(getByText('Delete Selected Deck'));
		expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteDecks, { deckIds: ['1'] });
	});

	it('allows cancelling selection mode', () => {
		const { getByText } = render(<DeckScreen />);

		// Long press to select Deck 1
		fireEvent(getByText('Deck 1'), 'longPress');

		// Click cancel button
		fireEvent.press(getByText('Cancel'));
		expect(callFunction).not.toHaveBeenCalled(); // Ensure delete function was not called
	});

	it('allows cancelling selection mode when no decks are selected', () => {
		const { getByText } = render(<DeckScreen />);

		// Long press to select Deck 1
		fireEvent(getByText('Deck 1'), 'longPress');
		fireEvent.press(getByText('Deck 1')); // Deselect Deck 1

		expect(callFunction).not.toHaveBeenCalled(); // Ensure delete function was not called
	});

	it('does not create a deck if the name is empty', async () => {
		const { getByPlaceholderText, getByText } = render(<DeckScreen />);

		const input = getByPlaceholderText('My amazing deck'); // Change this based on your placeholder
		fireEvent.changeText(input, ''); // Set empty deck name
		fireEvent.press(getByText('Create Deck')); // Press the button to create the deck

		expect(callFunction).not.toHaveBeenCalled(); // Ensure callFunction was not called
	});

	it('does not create a deck if the name is a duplicate', async () => {
		// Set up the mock data for existing decks
		const existingDecks = [{ id: '1', data: { name: 'Deck 1' } }];
		jest.mock('@/hooks/firebase/firestore', () => ({
			useDynamicDocs: jest.fn(() => existingDecks), // Return existing decks
		}));

		const { getByPlaceholderText, getByText } = render(<DeckScreen />);

		const input = getByPlaceholderText('My amazing deck'); // Change this based on your placeholder
		fireEvent.changeText(input, 'Deck 1'); // Use an existing deck name
		fireEvent.press(getByText('Create Deck')); // Press the button to create the deck

		expect(callFunction).not.toHaveBeenCalled(); // Ensure callFunction was not called
	});

	it('creates a deck successfully when the name is unique', async () => {
		const { getByPlaceholderText, getByText } = render(<DeckScreen />);

		// Mock successful response for creating a deck
		(callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { id: 'newDeckId' } });

		const input = getByPlaceholderText('My amazing deck'); // Change this based on your placeholder
		fireEvent.changeText(input, 'New Unique Deck'); // Set a unique deck name
		fireEvent.press(getByText('Create Deck')); // Press the button to create the deck

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalledWith(Memento.Functions.createDeck, {
				deck: {
					name: 'New Unique Deck',
					cards: []
				},
			}); // Ensure callFunction was called with correct arguments
		});
	});

	it('handles errors when creating a deck', async () => {
		const { getByPlaceholderText, getByText } = render(<DeckScreen />);

		// Mock an error response for creating a deck
		(callFunction as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

		const input = getByPlaceholderText('My amazing deck'); // Change this based on your placeholder
		fireEvent.changeText(input, 'Unique Deck'); // Set a unique deck name
		fireEvent.press(getByText('Create Deck')); // Press the button to create the deck

		await waitFor(() => {
			expect(callFunction).toHaveBeenCalled(); // Ensure callFunction was called
			// Optionally, you can check for an error message in your UI
		});
	});
});

// Test cases for the DeckDisplay component
describe('DeckDisplay', () => {
	const mockDeck: Memento.Deck = {
		name: 'Test Deck',
		cards: [{ question: 'What is 2 + 2?', answer: '4', learning_status: 'Got it' }],
	};

	const mockToggleSelection = jest.fn();
	const mockOnLongPress = jest.fn();

	it('navigates to the deck details when not in selection mode', () => {
		const { getByText } = render(
			<DeckDisplay
				deck={mockDeck}
				id="1"
				isSelected={false}
				toggleSelection={mockToggleSelection}
				onLongPress={mockOnLongPress}
				selectionMode={false}
			/>
		);

		// Simulate press on the DeckDisplay
		fireEvent.press(getByText('Test Deck'));

		// Check that the router pushed to the correct path
		expect(router.push).toHaveBeenCalledWith('/deck/1');
		expect(mockToggleSelection).not.toHaveBeenCalled(); // Should not be called since selectionMode is false
	});

	it('toggles selection when in selection mode', () => {
		const { getByText } = render(
			<DeckDisplay
				deck={mockDeck}
				id="1"
				isSelected={false}
				toggleSelection={mockToggleSelection}
				onLongPress={mockOnLongPress}
				selectionMode={true}
			/>
		);

		// Simulate press on the DeckDisplay
		fireEvent.press(getByText('Test Deck'));

		// Check that toggleSelection is called
		expect(mockToggleSelection).toHaveBeenCalledWith(mockDeck);
	});

	it('calls toggleSelection and onLongPress when long pressed', () => {
		const { getByText } = render(
			<DeckDisplay
				deck={mockDeck}
				id="1"
				isSelected={false}
				toggleSelection={mockToggleSelection}
				onLongPress={mockOnLongPress}
				selectionMode={true}
			/>
		);

		// Simulate long press on the DeckDisplay
		fireEvent(getByText('Test Deck'), 'longPress');

		// Check that toggleSelection and onLongPress are called
		expect(mockToggleSelection).toHaveBeenCalledWith(mockDeck);
		expect(mockOnLongPress).toHaveBeenCalled();
	});
});
