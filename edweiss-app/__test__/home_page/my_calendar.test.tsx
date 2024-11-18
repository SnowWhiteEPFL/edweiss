

import InfinitePaginatedCounterScreen from '@/app/(app)/calendar';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { NavigationContainer } from '@react-navigation/native';
import { render } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { Dimensions, ScaledSize } from 'react-native';






jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));


jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: jest.fn().mockReturnValue({
        Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
        Screen: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    }),
}));




jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

jest.mock('react-native-screens', () => {
    return {
        enableScreens: jest.fn(),
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
jest.mock('expo-screen-orientation', () => {
    const listeners: any[] = [];
    return {
        addOrientationChangeListener: jest.fn((listener) => {
            listeners.push(listener);
            return { remove: () => listeners.splice(listeners.indexOf(listener), 1) };
        }),
        removeOrientationChangeListener: jest.fn((listener) => {
            const index = listeners.indexOf(listener);
            if (index > -1) listeners.splice(index, 1);
        }),
        mockOrientationChange: (orientation: number) => {
            listeners.forEach((listener) =>
                listener({ orientationInfo: { orientation } })
            );
        },
    };
});

jest.mock('expo-router', () => ({
    router: { push: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</> // Simulate rendering the title for the test
        )),
    },
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
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 0,
                    rooms: [],
                },
                {
                    id: 'period1',
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 1,
                    rooms: [],
                },
                {
                    id: 'period1',
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 2,
                    rooms: [],
                },
                {
                    id: 'period1',
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 3,
                    rooms: [],
                },
                {
                    id: 'period1',
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 4,
                    rooms: [],
                },
                {
                    id: 'period1',
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 5,
                    rooms: [],
                },
                {
                    id: 'period1',
                    start: 0,
                    end: 1440,
                    type: 'lecture',
                    activityId: 'activity1',
                    dayIndex: 6,
                    rooms: [],
                },
            ],
            credits: 3,
            newAssignments: true,
            assignments: [{ id: 'assignment1' }],

        },
    },
];

describe('InfinitePaginatedCounterScreen Component', () => {
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
        Dimensions.get = jest.fn(() => ({ width: 400, height: 600, scale: 1, fontScale: 1 } as ScaledSize));
    });
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should change orientation when screen is rotated', () => {
        render(
            <NavigationContainer>
                <InfinitePaginatedCounterScreen />
            </NavigationContainer>
        );

        // Simulate a change of orientation
        (ScreenOrientation.addOrientationChangeListener as jest.Mock).mockImplementationOnce((listener) => {
            (listener as (event: { orientationInfo: { orientation: number } }) => void)({ orientationInfo: { orientation: 3 } });
            return { remove: jest.fn() };
        });

        expect(ScreenOrientation.addOrientationChangeListener).toHaveBeenCalled();
    });
});


