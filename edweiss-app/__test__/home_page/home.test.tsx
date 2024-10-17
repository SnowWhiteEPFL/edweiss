import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { render, screen } from '@testing-library/react-native';
import React from 'react';
import HomeTab from '../../app/(app)/(tabs)/index';

beforeEach(() => {
    render(<HomeTab />);
});

const mockCourses = [
    {
        id: 'course1',
        data: {
            periods: [
                {
                    id: 'period1',
                    start: 480,
                    end: 500,
                    dayIndex: 1,
                },
                {
                    id: 'period2',
                    start: 540,
                    dayIndex: 1,
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
                    start: 600,
                    dayIndex: 1,
                },
            ],
            name: 'Course 2',
            credits: 4,
        },
    },
];


jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));
jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));
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
};



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


    it('render hours', async () => {

        expect(screen.getByText('1:00')).toBeTruthy();
        expect(screen.getByText('2:00')).toBeTruthy();
        expect(screen.getByText('3:00')).toBeTruthy();
        expect(screen.getByText('13:00')).toBeTruthy();
        expect(screen.getByText('16:00')).toBeTruthy();
        expect(screen.getByText('22:00')).toBeTruthy();
    });
    it('render course name', async () => {

        expect(await screen.findByText('Course 1')).toBeTruthy();
        expect(await screen.findByText('Course 2')).toBeTruthy();
    });
    it('render course credits', async () => {

        expect(screen.getByText('Crédits: 3')).toBeTruthy();
        expect(screen.getByText('Crédits: 4')).toBeTruthy();
    });
    it('render List of courses', async () => {

        expect(screen.getByText('List of courses')).toBeTruthy();

    });
});



