import EventsPerDayScreen from '@/app/(app)/calendar';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

// Mock Firebase Functions
jest.mock('@react-native-firebase/functions', () => ({
    httpsCallable: jest.fn(() => () => Promise.resolve({ data: 'function response' })),
}));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        width: 600,
        height: 800,
    })),
}));

const MockTText = (props: React.HTMLAttributes<HTMLSpanElement>) => (
    <span {...props}>{props.children}</span>
);

jest.mock('@/app/(app)/calendar/VerticalCalendar', () => () => <MockTText>VerticalCalendar</MockTText>);
jest.mock('@/app/(app)/calendar/HorizontalCalendar', () => () => <MockTText>HorizontalCalendar</MockTText>);

jest.mock('@/app/(app)/calendar/VerticalCalendar', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return () => <Text>VerticalCalendar</Text>;
});

jest.mock('@/app/(app)/calendar/HorizontalCalendar', () => {
    const React = require('react');
    const { Text } = require('react-native');
    return () => <Text>HorizontalCalendar</Text>;
});



// Mock de Firebase Firestore
jest.mock('@react-native-firebase/firestore', () => {
    const mockGetDocs = jest.fn();
    return {
        getDocs: mockGetDocs,
        Timestamp: {
            now: jest.fn(() => ({
                toDate: jest.fn(() => new Date()),
            })),
        },
    };
});

// Mock d'autres dépendances Firebase si nécessaire
jest.mock('@react-native-firebase/auth', () => ({
    currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(() => Promise.resolve(true)),
        signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(true)),
        getTokens: jest.fn(() => Promise.resolve({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
    },
}));


// Mock Firebase Storage
jest.mock('@react-native-firebase/storage', () => ({
    ref: jest.fn(() => ({
        putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
        getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.png')),
    })),
}));
jest.mock('@react-native-firebase/firestore', () => {
    const collectionMock = jest.fn(() => ({
        doc: jest.fn(() => ({
            set: jest.fn(() => Promise.resolve()),
            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
        })),
        get: jest.fn(() => Promise.resolve({ docs: [] })),
    }));

    const firestoreMock = jest.fn(() => ({
        collection: collectionMock,
    }));

    return {
        __esModule: true,
        default: firestoreMock,
        firestore: firestoreMock, // Also export the mock to match the expected structure
        Timestamp: {
            now: jest.fn(() => ({
                toDate: jest.fn(() => new Date()),
            })),
        },
    };
});

describe('EventsPerDayScreen', () => {

    it('renders VerticalCalendar in landscape mode', async () => {
        // Simuler le mode paysage
        jest.spyOn(React, 'useState').mockImplementationOnce(() => [false, jest.fn()]);
        render(<EventsPerDayScreen />);
        expect(screen.getByText('VerticalCalendar')).toBeTruthy();
    });

});
