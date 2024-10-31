import MyCalendar from '@/app/(app)/my_Calendar';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { render } from '@testing-library/react-native';
import React from 'react';



jest.mock('@/components/core/header/RouteHeader', () => () => {
    return <div>Mocked RouteHeader</div>;
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

describe('my_Calendar', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should import the authenticated user correctly', () => {
        const mockUser = { uid: 'user-123' };
        (useAuth as jest.Mock).mockReturnValue({ authUser: mockUser });

        render(<MyCalendar />);

        expect(useAuth).toHaveBeenCalled();
        expect(useAuth().authUser).toEqual(mockUser);
    });

    it('should fetch user courses correctly', () => {
        const mockUser = { uid: 'user-123' };
        (useAuth as jest.Mock).mockReturnValue({ authUser: mockUser });

        (useDynamicDocs as jest.Mock)
            .mockReturnValueOnce([
                { id: 'course-1', data: {} },
                { id: 'course-2', data: {} },
            ])
            .mockReturnValueOnce([
                { id: 'course-1', data: {} },
                { id: 'course-3', data: {} },
            ]);
        render(<MyCalendar />);

        expect(useDynamicDocs).toHaveBeenCalledWith(
            expect.anything()
        );
    });
});
