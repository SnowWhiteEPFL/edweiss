import { EventsByDate, getNavigationDetails } from '@/app/(app)/calendar';
import VerticalCalendar from '@/app/(app)/calendar/VerticalCalendar';
import { formatDateToReadable2, generateWeekDates } from '@/components/calendar/functions';

import { useAuth } from '@/contexts/auth';
import { render, screen } from '@testing-library/react-native';
import React from 'react';



jest.mock('@react-native-firebase/auth', () => ({
    // Mock Firebase auth methods you use in your component
    signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
}));

jest.mock('@react-native-firebase/firestore', () => {
    const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
            set: jest.fn(() => Promise.resolve()),
            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
        })),
    }));

    // Ensure firestore is mocked as both a function and an object with methods
    return {
        __esModule: true,
        default: jest.fn(() => ({
            collection: mockCollection,
        })),
        collection: mockCollection
    };
});

// Mock Firebase Functions
jest.mock('@react-native-firebase/functions', () => ({
    httpsCallable: jest.fn(() => () => Promise.resolve({ data: 'function response' })),
}));

// Mock Firebase Storage
jest.mock('@react-native-firebase/storage', () => ({
    ref: jest.fn(() => ({
        putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
        getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.png')),
    })),
}));


jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),					// mock authentication
}));

jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(() => ({
        user: { id: '123', name: 'Mocked User', type: 'student' },
    })),
}));


jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({ // mock google sign-in
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(() => Promise.resolve(true)),
        signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(true)),
        getTokens: jest.fn(() => Promise.resolve({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
    },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));


describe('VerticalCalendar', () => {
    const mockAuthUser = { id: 1, name: 'Test User' };
    const eventsByDate: EventsByDate = {
        '2024-12-24': [
            {
                name: 'Event 1',
                startTime: 0,
                endTime: 1200,
                type: 'Course',
                period: {
                    type: 'lecture', // Example type within CourseTimePeriod
                    dayIndex: 1, // Monday
                    start: 60,
                    end: 120,
                    rooms: [{
                        name: 'Room 101',
                        geoloc: { latitude: 0, longitude: 0 } // Replace with a valid Geopoint
                    }], // Example rooms
                }, // Single CourseTimePeriod object
                course: {
                    id: '1', data: {
                        name: 'Course 1',
                        description: '',
                        professors: [],
                        assistants: [],
                        periods: [{
                            type: 'lecture', // Example type within CourseTimePeriod
                            dayIndex: 1, // Monday
                            start: 60,
                            end: 120,
                            rooms: [{
                                name: 'Room 101',
                                geoloc: { latitude: 0, longitude: 0 } // Replace with a valid Geopoint
                            }], // Example rooms
                        }],
                        section: 'IN',
                        credits: 0,
                        newAssignments: false,
                        assignments: [],
                        started: false
                    }
                },
            },
            {
                name: 'Event 2',
                startTime: 180,
                endTime: 240,
                type: 'Todo',
            },
        ],
        '2023-10-02': [],
    };


    beforeEach(() => {
        (useAuth as jest.Mock).mockReturnValue({ authUser: mockAuthUser });
        jest.clearAllMocks();
    });

    test('renders the calendar with days of the week', () => {
        render(<VerticalCalendar eventsByDate={eventsByDate} />);
        expect(screen.getByText('Monday, December 23')).toBeTruthy();
        // Check that days of the week are rendered
        const daysOfWeek = generateWeekDates().map(date => formatDateToReadable2(new Date(date)));
        daysOfWeek.forEach((day) => {
            expect(screen.getAllByText(day)).toBeTruthy();
        });
    });

    test('renders the correct number of hours', () => {
        render(<VerticalCalendar eventsByDate={eventsByDate} />);
        for (let i = 0; i < 24; i++) {
            const formattedHour = i.toString().padStart(2, '0'); // Formater l'heure avec deux chiffres
            expect(screen.getAllByText(`${formattedHour}:00`)).toBeTruthy();
        }
    });

    test('renders events for the correct days and times', () => {
        render(<VerticalCalendar eventsByDate={eventsByDate} />);

        // Check that event names are rendered
        expect(screen.getByText('Event 1')).toBeTruthy();
        expect(screen.getByText('Event 2')).toBeTruthy();
    });

});

describe('getNavigationDetails', () => {
    const courseItemMock = {
        id: 'course123',
        data: { name: 'Math 101' } as Course,
    };

    const periodMock = {
        activityId: 'activity456',
    };

    it('should return correct navigation details for a professor', () => {
        const userMock = { data: { type: 'professor' } };

        const result = getNavigationDetails(userMock, courseItemMock, periodMock, 0);

        expect(result).toEqual({
            pathname: '/(app)/startCourseScreen',
            params: {
                courseID: 'course123',
                course: JSON.stringify(courseItemMock.data),
                period: JSON.stringify(periodMock),
                index: 0,
            },
        });
    });

    it('should return correct navigation details for a student', () => {
        const userMock = { data: { type: 'student' } };

        const result = getNavigationDetails(userMock, courseItemMock, periodMock, 0);

        expect(result).toEqual({
            pathname: '/(app)/lectures/slides',
            params: {
                courseNameString: 'Math 101',
                lectureIdString: 'activity456',
            },
        });
    });
});

