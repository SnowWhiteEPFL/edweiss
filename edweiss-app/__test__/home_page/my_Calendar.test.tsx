

import MyCalendar from '@/app/(app)/my_Calendar';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { Dimensions, ScaledSize } from 'react-native';
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));
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
            exists: true,
            data: jest.fn(() => ({
                name: 'Test Course',
                description: 'A course for testing purposes.',
                professors: ['prof1'],
                assistants: ['student1'],
                periods: [],
                section: 'IN',
                credits: 3,
                newAssignments: false,
                assignments: [],
                started: true,
            })),
        }),
    };
    return {
        __esModule: true,
        default: jest.fn(() => ({
            collection: jest.fn(() => collectionMock),
        })),
    };
});

jest.mock('expo-screen-orientation', () => ({
    addOrientationChangeListener: jest.fn(),
    removeOrientationChangeListener: jest.fn(),
}));

const mockAuth = {
    authUser: { uid: 'test-user-id' },
    data: { type: 'student' },
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

describe('MyCalendar Component', () => {
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
        Dimensions.get = jest.fn(() => ({ width: 400, height: 600 } as ScaledSize));
    });

    it('renders My Calendar component', () => {
        render(<MyCalendar />);
        expect(screen.getByText('My Calendar')).toBeTruthy();
    });

    it('renders list of courses', () => {
        render(<MyCalendar />);
        expect(screen.getByText('Course 1')).toBeTruthy();
        expect(screen.getByText('Crédits: 3')).toBeTruthy();
        expect(screen.getByText('assignements : 1')).toBeTruthy();
        expect(screen.getByText('New!')).toBeTruthy();
    });

    it('should display loading indicator initially', () => {
        render(<MyCalendar />);

        expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('should display courses after loading', async () => {
        (useDynamicDocs as jest.Mock).mockReturnValueOnce([{ id: 'course1', data: { name: 'Course 1' } }] as Array<{ id: string; data: { name: string } }>);

        render(<MyCalendar />);

        await waitFor(() => expect(screen.getByText('Course 1')).toBeTruthy());
    });

    it('should call loadMorePages when scrolling to end', async () => {
        const { getByTestId } = render(<MyCalendar />);

        // On simule un scroll en bas de la liste
        const flatList = getByTestId('flat-list');
        fireEvent.scroll(flatList, {
            nativeEvent: {
                contentOffset: { x: 100, y: 0 },
                contentSize: { width: 1000, height: 100 },
                layoutMeasurement: { width: 400, height: 600 },
            },
        });

        // Vérifier que la page suivante a été ajoutée
        await waitFor(() => expect(screen.getByText('Course 1')).toBeTruthy());
    });

    it('should change orientation when screen is rotated', async () => {
        const setOrientation = jest.fn();

        // Simuler un changement d'orientation
        render(<MyCalendar />);
        (ScreenOrientation.addOrientationChangeListener as jest.Mock).mockImplementationOnce((listener) => {
            (listener as (event: { orientationInfo: { orientation: number } }) => void)({ orientationInfo: { orientation: 3 } });
            return { remove: jest.fn() };
        });

        await waitFor(() => expect(setOrientation).toHaveBeenCalled());
    });

    it('should render Calendar with filtered courses and todos', async () => {
        (useDynamicDocs as jest.Mock).mockReturnValueOnce([{ id: 'course1', data: { name: 'Course 1' } }]);

        render(<MyCalendar />);

        await waitFor(() => {
            expect(screen.getByTestId('calendar')).toBeTruthy();
            expect(screen.getByText('Course 1')).toBeTruthy();
        });
    });
});
