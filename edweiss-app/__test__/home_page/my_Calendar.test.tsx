// InfinitePaginatedCounterScreen.test.tsx

import HomeTab from '@/app/(app)/(tabs)/GwenHomePage';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue('mocked value'),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('i18next-react-native-async-storage', () => ({
    default: jest.fn().mockReturnValue({
        use: jest.fn().mockReturnThis(), // Mock de la méthode use pour permettre le chaînage
    }),
}));

jest.mock('@react-native-firebase/auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' },
    })),
}));

jest.mock('expo-screen-orientation', () => ({
    addOrientationChangeListener: jest.fn(),
    removeOrientationChangeListener: jest.fn(),
    lockAsync: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => {
    const collectionMock = {
        doc: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
            id: 'course1',
            data: jest.fn(() => mockCourses.map((course) => course.data)),
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

const mockAuth = {
    authUser: { uid: 'test-user-id' },
    data: { type: 'professor' },
};

const mockCourses = [
    {
        id: 'course1',
        data: {
            name: 'Course 1',
            periods: [
                {
                    id: 'period1',
                    start: 480,
                    end: 540,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 1,
                    rooms: [],
                },
            ],
            credits: 3,
            newAssignments: true,
            assignments: [{ id: 'assignment1' }],
        },
    },
];

describe('HomeTab Component', () => {
    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue(mockAuth);
        (useDynamicDocs as jest.Mock).mockImplementation((collection) => {
            if (collection === 'courses') {
                return mockCourses;
            }
            if (collection === `users/${mockAuth.authUser.uid}/courses`) {
                return mockCourses;
            }
            return [];
        });
    });

    it('renders List', () => {
        render(<HomeTab />);
        expect(screen.getByText('List of courses')).toBeTruthy();
    });
    it('renders hours', () => {
        render(<HomeTab />);
        expect(screen.getByText('22:00')).toBeTruthy();
    });



});
