import { Calendar } from '@/components/core/calendar';
import { getWeekDates } from '@/components/core/getWeekDates';
import { AssignmentType, CourseTimePeriod, Section } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { act, render, screen } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

// Mocking Firebase Firestore Timestamp with Jest
const Timestamp = {
    // Simulating the `fromDate` method
    fromDate: jest.fn((date) => {
        const timestamp = new Date(date); // Create a `Date` object from the parameter

        return {
            // Returning an object that mimics Firebase's `Timestamp`
            seconds: Math.floor(timestamp.getTime() / 1000), // Convert the time to seconds
            nanoseconds: (timestamp.getTime() % 1000) * 1000000, // Extract nanoseconds
            toDate: jest.fn(() => timestamp), // Adding `toDate` to return the original `Date`
        };
    }),

    // Simulating static methods that might be used in tests
    seconds: 0,
    nanoseconds: 0,
};

// Mock Firestore module with the `Timestamp`
module.exports = { firestore: { Timestamp } };

// Convert a date string to a Date object
const dateString = "2024-11-24T00:00:00";
const date = new Date(dateString);

// Mock data for Todos
const mockTodos = [
    { id: 'todo1', data: { dueDate: Timestamp.fromDate(date), title: 'Test Todo', completed: false, name: 'Todo 1', status: 'incomplete' as Todolist.TodoStatus } },
];


// Mock data for assignments
const mockAssignments = [{ id: 'assignment1', data: { title: 'Test Assignment', dueDate: Timestamp.fromDate(date), type: 'homework' as AssignmentType, name: 'Assignment 1' } }];

// Define a mock period for courses
const mockPeriod = { id: 'period1', name: 'Period 1', type: 'lecture', dayIndex: 1, start: 540, end: 600, rooms: [] }; // Define mockPeriod

// Mock data for courses
const mockCourses = [{
    id: 'course1',
    data: {
        name: 'Course 1',
        started: true,
        description: 'Course description',
        professors: ['Professor 1'],
        assistants: ['Assistant 1'],
        periods: [mockPeriod] as CourseTimePeriod[],
        credits: 3,
        department: 'Department 1',
        section: 'IN' as Section, // Adjust this to match the correct enum value
        newAssignments: true,
        assignments: [],
    },
}];

// Mock Firebase Authentication to simulate the current user
jest.mock('@react-native-firebase/auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' }, // Simulated user ID
    })),
}));

// Mock Firebase Firestore to simulate fetching course data from the database
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

// Mock Firebase Functions to simulate callable functions
jest.mock('@react-native-firebase/functions', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        httpsCallable: jest.fn(),
    })),
}));

// Mock Firebase Storage to simulate file storage operations
jest.mock('@react-native-firebase/storage', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        ref: jest.fn(),
    })),
}));

// Mock Google SignIn SDK methods for testing purposes
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

// Mock the Expo Screen Orientation module to handle orientation changes in tests
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

// Mock routing functionality for navigation during tests
jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

// Test case to check the display of assignments and todos
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

// Mocking the `getWeekDates` function to simulate fetching week dates
jest.mock('@/components/core/getWeekDates', () => ({
    getWeekDates: jest.fn(),
}));

// Test case to check the week view rendering
test('displays week view correctly', () => {


    // Mocked week dates to simulate the output of `getWeekDates`
    const weekDates = [
        new Date('2024-11-23T00:00:00'),
        new Date('2024-11-24T00:00:00'),
        new Date('2024-11-25T00:00:00'),
        new Date('2024-11-26T00:00:00'),
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

    // Verify that each day of the week is displayed correctly
    expect(screen.getByText('dim. 24 nov.')).toBeTruthy();
    expect(screen.getByText('lun. 25 nov.')).toBeTruthy();
    expect(screen.getByText('mar. 26 nov.')).toBeTruthy();
});

// Test case to simulate screen orientation change and check layout updates
test('changes layout when screen orientation changes', () => {


    const onOrientationChange = jest.fn();
    (ScreenOrientation.addOrientationChangeListener as jest.Mock).mockImplementation((callback: ((...args: any) => any) | undefined) => {
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

    // Simulate an orientation change (e.g., landscape mode)
    act(() => {
        onOrientationChange({ orientationInfo: { orientation: 1 } });
    });

    // Verify that the layout has been updated (check for UI elements related to the orientation change)
    expect(screen.getByText('lun. 25 nov.')).toBeTruthy();
});

// Mocking the Expo Router for navigation purposes in the tests
jest.mock('expo-router', () => ({
    router: { push: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</> // Simulate rendering the title for the test
        )),
    },
}));

// Basic test to render the Calendar component with expected data
test('renders Calendar component', () => {

    render(
        <Calendar
            courses={mockCourses}
            assignments={mockAssignments}
            todos={mockTodos}
            type="day"
            date={date}
        />
    );

    // Verify that the date is displayed correctly
    expect(screen.getByText('dimanche 24 novembre')).toBeTruthy();

    // Check if the hour 9:00 AM is displayed
    expect(screen.getByText('9:00')).toBeTruthy();
    expect(screen.findByTestId('testID="current-time-line')).toBeTruthy();
    expect(screen.getByText('Assignment 1')).toBeTruthy();
    expect(screen.getByText('Assignments Due Today:')).toBeTruthy();
});
