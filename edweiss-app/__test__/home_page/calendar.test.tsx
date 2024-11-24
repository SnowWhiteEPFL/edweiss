import { act, render, screen } from '@testing-library/react-native';

import { Calendar } from '@/components/core/calendar';
import { getWeekDates } from '@/components/core/getWeekDates';
import { AssignmentBase, Course, CourseTimePeriod, Section } from '@/model/school/courses';
import Todolist from '@/model/todo';
import * as ScreenOrientation from 'expo-screen-orientation';

import { AssignmentType } from '@/model/school/courses';
import { CourseTimePeriodType } from '@/model/school/schedule';

// Mock de Firebase Firestore avec Jest
const Timestamp = {
    // Simulation de la méthode `fromDate`
    fromDate: jest.fn((date) => {
        const timestamp = new Date(date); // Créer un objet `Date` à partir du paramètre

        return {
            // Retourner un objet qui simule le `Timestamp` de Firebase
            seconds: Math.floor(timestamp.getTime() / 1000), // Convertir le temps en secondes
            nanoseconds: (timestamp.getTime() % 1000) * 1000000, // Extraire les nanosecondes
            toDate: jest.fn(() => timestamp), // Ajouter `toDate` qui retourne le `Date` d'origine
        };
    }),

    // Simuler des méthodes statiques qui pourraient être utilisées dans les tests
    seconds: 0,
    nanoseconds: 0,
};

module.exports = { firestore: { Timestamp } };


module.exports = {
    firestore: {
        Timestamp,
    },
};


const mockTodos = [
    { id: 'todo1', data: { dueDate: Timestamp.fromDate(new Date()), title: 'Test Todo', completed: false, name: 'Todo 1', status: 'incomplete' as Todolist.TodoStatus, } },
];



// Conversion d'une chaîne de caractères en un objet Date
const dateString = "2024-11-24T00:00:00";
const date = new Date(dateString);


jest.mock('firebase/firestore', () => {
    return {
        firestore: {
            Timestamp: {
                fromDate: jest.fn(() => new Date()),
            },
        },
    };
});

const mockAssignments = [{ id: 'assignment1', data: { title: 'Test Assignment', dueDate: Timestamp.fromDate(new Date()), type: 'homework' as AssignmentType, name: 'Assignment 1' } }];

const mockPeriod = { id: 'period1', name: 'Period 1', type: 'lecture', dayIndex: 1, start: 540, end: 600, rooms: [] }; // Define mockPeriod
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
jest.mock('@react-native-firebase/auth', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        currentUser: { uid: 'test-user-id' },
    })),
}));
jest.mock('firebase/firestore', () => {
    return {
        firestore: {
            Timestamp: {
                fromDate: jest.fn(() => new Date()),
            },
        },
    };
});

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

test('displays assignments and todos correctly', () => {
    const mockCourses = [
        {
            id: '1',
            data: {
                name: 'Course 1',
                started: true,
                description: 'Course description',
                professors: ['Professor 1'],
                assistants: ['Assistant 1'],
                periods: [{ type: 'lecture', dayIndex: 1, start: 540, end: 600, rooms: [] }] as CourseTimePeriod[],
                credits: 3,
                department: 'Department 1',
                section: 'IN' as Section,
                newAssignments: true,
                assignments: [],
            },
        },
    ];

    const mockAssignments = [
        { id: '1', data: { dueDate: Timestamp.fromDate(new Date('2024-11-24T00:00:00')), type: 'homework' as AssignmentType, name: 'Assignment 1' } },
    ];

    const mockTodos = [
        { id: '1', data: { dueDate: Timestamp.fromDate(new Date('2024-11-24T00:00:00')), name: 'Todo 1', status: 'incomplete' as Todolist.TodoStatus } },
    ];

    const mockDate = new Date('2024-11-24T00:00:00');

    render(
        <Calendar
            courses={mockCourses}
            assignments={mockAssignments}
            todos={mockTodos}
            type="day"
            date={mockDate}
        />
    );
    expect(screen.getByText('Todo 1')).toBeTruthy();
});

jest.mock('@/components/core/getWeekDates', () => ({
    getWeekDates: jest.fn(),
}));

test('displays week view correctly', () => {
    const mockCourses: { id: string; data: Course; }[] = [];
    const mockAssignments: { id: string; data: AssignmentBase; }[] = [];
    const mockTodos: { id: string; data: Todolist.Todo; }[] = [];
    const mockDate = new Date('2024-11-24T00:00:00');

    // Mock des dates de la semaine
    const weekDates = [
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
            date={mockDate}
        />
    );

    // Vérifie que la date de chaque jour de la semaine est affichée
    expect(screen.getByText('dim. 24 nov.')).toBeTruthy();
    expect(screen.getByText('lun. 25 nov.')).toBeTruthy();
    expect(screen.getByText('mar. 26 nov.')).toBeTruthy();
});

jest.mock('@/utils/calendar/getCurrentTimeInMinutes', () => ({
    getCurrentTimeInMinutes: jest.fn(),
}));



jest.mock('expo-screen-orientation', () => ({
    addOrientationChangeListener: jest.fn(),
    removeOrientationChangeListener: jest.fn(),
}));

test('changes layout when screen orientation changes', () => {
    const mockCourses = [
        { id: '1', data: { periods: [{ dayIndex: 1, start: 540, end: 600, type: 'lecture' as CourseTimePeriodType, rooms: [] }] as CourseTimePeriod[], name: 'Course 1', description: 'Course description', professors: ['Professor 1'], assistants: ['Assistant 1'], section: 'IN' as Section, credits: 3, department: 'Department 1', started: true, newAssignments: false, assignments: [] } },
    ];
    const mockAssignments: { id: string; data: AssignmentBase; }[] = [];
    const mockTodos: { id: string; data: Todolist.Todo; }[] = [];
    const mockDate = new Date('2024-11-24T00:00:00');
    const mockPeriod = { id: 'period1', name: 'Period 1' }; // Define mockPeriod
    // Mock de l'orientation
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
            date={mockDate}
        />
    );

    // Change l'orientation
    act(() => {
        onOrientationChange({ orientationInfo: { orientation: 1 } });
    });

    // Vérifie que la vue a été mise à jour
    expect(screen.getByText('lun. 25 nov.')).toBeTruthy();
});

jest.mock('@react-navigation/native', () => ({
    useNavigation: jest.fn(),
}));

// Mock des props
const mockDate = new Date('2024-11-24T00:00:00');

test('renders Calendar component', () => {
    render(<Calendar courses={mockCourses} assignments={mockAssignments} todos={mockTodos} type="day" date={mockDate} />);

    // Vérifie que la date du jour est affichée correctement
    expect(screen.getByText('dimanche 24 novembre')).toBeTruthy();

    // Vérifie que l'heure 9:00 AM est bien affichée dans la vue
    expect(screen.getByText('9:00')).toBeTruthy();

    // Vérifie qu'un devoir et une tâche sont bien affichés pour cette heure-là
    expect(screen.getByText('Assignment 1')).toBeTruthy();
    expect(screen.getByText('Assignments Due Today:')).toBeTruthy();
});
