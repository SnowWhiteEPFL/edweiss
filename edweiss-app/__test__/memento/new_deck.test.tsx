/**
 * @file deck.test.tsx
 * @description Unit tests for the DeckScreen and DeckDisplay components in the Memento module
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import DeckScreen from '@/app/(app)/courses/[id]/deck';
import { callFunction } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { ProfessorUser } from '@/model/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import 'react-native';
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

const deck1: Memento.Deck = {
    ownerID: ["tuan"],
    name: 'Deck 1',
    cards: []
}

RepositoryMock.mockRepository<Memento.Deck>([{
    ownerID: ["tuan"], name: 'Deck 1', cards: []
}]);

const mockAddDocument = jest.fn();

const mockDeleteDocuments = jest.fn();

jest.mock('@/hooks/repository', () => ({
    ...jest.requireActual('@/hooks/repository'),
    useRepository: jest.fn(() => [[{ id: '1', data: { ownerID: ['tuan'], name: 'Deck 1', cards: [] } }], { deleteDocuments: mockDeleteDocuments, addDocument: mockAddDocument }]),
}));

jest.mock('@/hooks/routeParameters', () => ({
    useStringParameters: jest.fn(() => ({ id: 'course_id' }))
}));

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { deck: `users/tuan/courses/course_id/decks` },
    CollectionOf: jest.fn((path: string) => {
        return path;
    }),
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

const TeacherAuthMock = {
    id: "tuan", data: { type: 'professor', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as ProfessorUser,
};

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

describe('DeckScreen', () => {

    it('renders without crashing', () => {
        const mockUsers = [TeacherAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

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
        expect(router.push).toHaveBeenCalledWith('courses/course_id/deck/1');
    });

    it('allows selecting and deleting decks', async () => {
        const { getByText } = render(<DeckScreen />);

        // Long press to select Deck 1
        fireEvent(getByText('Deck 1'), 'longPress');

        // Click delete button
        fireEvent.press(getByText('Delete'));
        //expect(callFunction).toHaveBeenCalledWith(Memento.Functions.deleteDecks, { deckIds: ['1'] });

        await waitFor(() => {
            expect(mockDeleteDocuments).toHaveBeenCalledWith(
                ['1'], expect.any(Function)
            );

            expect(callFunction).not.toHaveBeenCalled();
        });

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
                courseId: 'course_id',
                deck: {
                    ownerID: ['tuan'],
                    name: 'New Unique Deck',
                    cards: []
                },
            }); // Ensure callFunction was called with correct arguments
        });
    });

    it('can click on generate with AI button', async () => {
        const { getByText } = render(<DeckScreen />);
        fireEvent.press(getByText('Generate with AI'));

    });

});