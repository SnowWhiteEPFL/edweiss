import MementoLayout from '@/app/(app)/courses/[id]/deck/_layout';
import { render } from '@testing-library/react-native';

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

// Mock expo-router
jest.mock('expo-router', () => ({
    useRouter: jest.fn(() => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() })),
    useSegments: jest.fn(() => []),
}));

// Firebase modules
jest.mock('@react-native-firebase/auth', () => ({
    currentUser: { uid: 'anonymous' },
    signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'anonymous' } })),
}));

// useAuth hook to return a user with an `authUser` and `uid`
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({
        authUser: { uid: 'anonymous' },
    })),
}));

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { deck: 'decks' },
    CollectionOf: jest.fn(() => 'decks'),
}));

jest.mock('@/hooks/routeParameters', () => ({
    useStringParameters: jest.fn(() => ({ id: 'course_id' }))
}));

// Mock the RepositoryLayout component
jest.mock('@/hooks/repository', () => ({
    createRepository: jest.fn(() => ({
        useCollection: jest.fn(() => ({
            data: [],
            loading: false,
            error: undefined,
        })),
    })),
    RepositoryLayout: jest.fn(() => null),
}));

describe('MementoLayout', () => {
    it('should render and print the output', () => {
        render(<MementoLayout />);
    });
});
