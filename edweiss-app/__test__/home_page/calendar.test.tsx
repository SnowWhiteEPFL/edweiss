import { Calendar } from '@/components/core/calendar';
import { getWeekDates } from '@/components/core/getWeekDates';
import { AssignmentType } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { act, render, screen } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { initCourse, initPeriod } from './helper_functions';


// Mocking Firebase Firestore Timestamp with Jest
const Timestamp = {
    fromDate: jest.fn((date) => {
        const timestamp = new Date(date);
        return {
            seconds: Math.floor(timestamp.getTime() / 1000),
            nanoseconds: (timestamp.getTime() % 1000) * 1000000,
            toDate: jest.fn(() => timestamp),
        };
    }),
    seconds: 0,
    nanoseconds: 0,
};
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
module.exports = { firestore: { Timestamp } };

// Convert a date string to a Date object
const dateString = "2024-11-24T00:00:00";
const date = new Date(dateString);

// Mock data for Todos
const mockTodos = [
    { id: 'todo1', data: { dueDate: Timestamp.fromDate(date), title: 'Test Todo', completed: false, name: 'Todo 1', status: 'incomplete' as Todolist.TodoStatus } },
];

// Mock data for assignments
const mockAssignments = [
    { id: 'assignment1', data: { title: 'Test Assignment', dueDate: Timestamp.fromDate(date), type: 'homework' as AssignmentType, name: 'Assignment 1' } },
];

// Use `initPeriod` to define a period
const mockPeriod = initPeriod(540, 600, 'lecture', 'Period 1', 1, 'Room 101');

// Use `initCourse` to define a course
const mockCourses = [
    initCourse({
        id: 'course1',
        name: 'Course 1',
        description: 'Course description',
        professors: ['Professor 1'],
        assistants: ['Assistant 1'],
        periods: [mockPeriod],
        credits: 3,
        section: 'IN',
        newAssignments: true,
        assignments: [],
    }),
];

// Mock Firebase Authentication
jest.mock('@react-native-firebase/auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' },
    })),
}));

// Mock Firebase Firestore
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

// Mock Expo Screen Orientation
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

// Test case: displaying assignments and todos correctly
test('displays assignments and todos correctly', () => {
    render(
        <Calendar
            courses={mockCourses}
            assignments={mockAssignments}
            todos={mockTodos}
            type="day"
            date={date}
        />
    );
    expect(screen.getByText('Todo 1')).toBeTruthy();
});

// Test case: displaying week view correctly
jest.mock('@/components/core/getWeekDates', () => ({
    getWeekDates: jest.fn(),
}));

test('displays week view correctly', () => {
    const weekDates = [
        new Date('2024-11-23T00:00:00'),
        new Date('2024-11-24T00:00:00'),
        new Date('2024-11-25T00:00:00'),
    ];
    (getWeekDates as jest.Mock).mockReturnValue(weekDates);

    render(
        <Calendar
            courses={mockCourses}
            assignments={mockAssignments}
            todos={mockTodos}
            type="week"
            date={date}
        />
    );
    expect(screen.getByText('dim. 24 nov.')).toBeTruthy();
    expect(screen.getByText('lun. 25 nov.')).toBeTruthy();
});

// Test case: changes layout on orientation change
test('changes layout when screen orientation changes', () => {
    const onOrientationChange = jest.fn();
    (ScreenOrientation.addOrientationChangeListener as jest.Mock).mockImplementation((callback: any) => {
        onOrientationChange.mockImplementation(callback);
    });

    render(
        <Calendar
            courses={mockCourses}
            assignments={mockAssignments}
            todos={mockTodos}
            type="week"
            date={date}
        />
    );

    act(() => {
        onOrientationChange({ orientationInfo: { orientation: 1 } });
    });
    expect(screen.getByText('lun. 25 nov.')).toBeTruthy();
});
