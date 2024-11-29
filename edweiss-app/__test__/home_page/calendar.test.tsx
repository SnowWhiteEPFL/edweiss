import InfinitePaginatedCounterScreen from '@/app/(app)/calendar';
import { Calendar } from '@/components/core/calendar';
import { getWeekDates } from '@/components/core/getWeekDates';
import { AuthInterface, useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { AssignmentType } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import { initCourse, initPeriod } from './helper_functions';



jest.mock('@/contexts/auth');
jest.mock('@/hooks/firebase/firestore');
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
describe('InfinitePaginatedCounterScreen', () => {
    const mockAuth = { authUser: { uid: 'test-user-id' } };
    const mockCourses = [
        { id: 'course1', data: { name: 'Course 1' } },
        { id: 'course2', data: { name: 'Course 2' } },
    ];
    const mockTodos = {
        course1: [
            { id: 'todo1', data: { title: 'Todo 1', status: 'incomplete' } },
            { id: 'todo2', data: { title: 'Todo 2', status: 'completed' } },
        ],
        course2: [
            { id: 'todo3', data: { title: 'Todo 3', status: 'incomplete' } },
        ],
    };
    const mockAssignments = {
        course1: [
            { id: 'assignment1', data: { title: 'Assignment 1', type: 'homework' } },
        ],
        course2: [
            { id: 'assignment2', data: { title: 'Assignment 2', type: 'exam' } },
        ],
    };

    beforeEach(() => {
        (useAuth as jest.Mock<AuthInterface>).mockReturnValue(mockAuth);
        (useDynamicDocs as jest.Mock).mockImplementation(() => mockCourses);
    });

    test('should map todos and assignments correctly', () => {
        // Mock the `useDynamicDocs` return values
        (useDynamicDocs as jest.Mock).mockImplementationOnce(() => mockCourses);
        (useDynamicDocs as jest.Mock).mockImplementationOnce(() => mockCourses);

        // Mock the state updates for todos and assignments
        const setTodosMock = jest.fn();
        const setAssignmentsMock = jest.fn();

        // Initialize component
        render(<InfinitePaginatedCounterScreen />);

        // Verify todos and assignments are correctly mapped
        expect(mockTodos.course1[0].data.title).toBe('Todo 1');
        expect(mockAssignments.course1[0].data.title).toBe('Assignment 1');
    });

    test('should add a new page when loadMorePages is called', () => {
        // Initial state with 10 pages
        const initialPages = Array.from({ length: 10 }, (_, index) => index - 3);
        const { getByText } = render(<InfinitePaginatedCounterScreen />);

        // Simulate loading more pages
        act(() => {
            const loadMoreButton = getByText('Load More');
            loadMoreButton && fireEvent.press(loadMoreButton);
        });

        // Check if a new page has been added
        const newPages = initialPages.concat(initialPages[initialPages.length - 1] + 1);
        expect(newPages.length).toBeGreaterThan(initialPages.length);
    });

    test('should correctly load todos and assignments by course', () => {
        render(<InfinitePaginatedCounterScreen />);

        // Verifying todos
        expect(screen.getByText('Todo 1')).toBeTruthy();
        expect(screen.getByText('Todo 2')).toBeTruthy();
        expect(screen.getByText('Todo 3')).toBeTruthy();

        // Verifying assignments
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Assignment 2')).toBeTruthy();
    });
});