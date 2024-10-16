import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import HomeTab from '../app/(app)/(tabs)/index';

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));
jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

// Mock functions for testing
const mockAuth = {
    authUser: { uid: 'test-user-id' },
};

const mockCourses = [
    {
        id: 'course1',
        data: {
            periods: [
                {
                    id: 'period1',
                    start: 480, // 8:00 AM
                    dayIndex: 1, // Lundi
                },
                {
                    id: 'period2',
                    start: 540, // 9:00 AM
                    dayIndex: 1, // Lundi
                },
            ],
            name: 'Course 1',
            credits: 3,
        },
    },
    {
        id: 'course2',
        data: {
            periods: [
                {
                    id: 'period3',
                    start: 600, // 10:00 AM
                    dayIndex: 1, // Lundi
                },
            ],
            name: 'Course 2',
            credits: 4,
        },
    },
];

// Mock React Native Firebase modules
jest.mock('@react-native-firebase/auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' },
    })),
}));

jest.mock('@react-native-firebase/firestore', () => {
    const collectionMock = {
        doc: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            id: 'course1',
            data: () => ({
                periods: [
                    {
                        id: 'period1',
                        start: 480, // 8:00 AM
                        dayIndex: 1, // Lundi
                    },
                    {
                        id: 'period2',
                        start: 540, // 9:00 AM
                        dayIndex: 1, // Lundi
                    },
                ],
                name: 'Course 1',
                credits: 3,
            }),
        }),
    };
    return {
        __esModule: true,
        default: jest.fn(() => ({
            collection: jest.fn(() => collectionMock),
        })),
        FirebaseFirestoreTypes: {
            DocumentReference: jest.fn(),
        },
    };
});

jest.mock('@react-native-firebase/functions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        httpsCallable: jest.fn(),
    })),
}));

jest.mock('@react-native-firebase/storage', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        ref: jest.fn(),
    })),
}));

// Mock @react-native-google-signin/google-signin module
jest.mock('@react-native-google-signin/google-signin', () => ({
    __esModule: true,
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(),
        signIn: jest.fn(),
        signOut: jest.fn(),
        isSignedIn: jest.fn(),
        getCurrentUser: jest.fn(),
    },
}));

describe('HomeTab Component', () => {
    (useAuth as jest.Mock).mockReturnValue(mockAuth);

    (useDynamicDocs as jest.Mock).mockImplementation((collection) => {
        if (collection === CollectionOf('courses')) {
            return mockCourses;
        }
        if (collection === CollectionOf(`users/${mockAuth.authUser.uid}/courses`)) {
            return mockCourses;
        }
        return [];
    });

    it('renders the Calendar component with course data', async () => {

        render(<HomeTab />);

        expect(screen.getByText('Course 1')).toBeTruthy();
        expect(screen.getByText('Course 2')).toBeTruthy();

    });

    it('renders a list of courses correctly', async () => {

        render(<HomeTab />);
        expect(screen.getByText('Crédits: 3')).toBeTruthy();
        expect(screen.getByText('Crédits: 4')).toBeTruthy();

    });

    it('conditionally renders "Join Course" or "Start/Stop Course" based on user type', async () => {
        render(<HomeTab />);



        // Mock user type as 'professor'
        const mockProfessorUser = { ...mockAuth, data: { type: 'professor' } };
        (useAuth as jest.Mock).mockReturnValue(mockProfessorUser);
        render(<HomeTab />);

        expect(screen.getByText('23:00')).toBeTruthy();
        expect(screen.getByText('10:00')).toBeTruthy();

    });
});
