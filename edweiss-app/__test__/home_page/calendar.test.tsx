// __tests__/Calendar.test.tsx


import { Calendar } from '@/components/core/calendar';
import { render, screen } from '@testing-library/react-native';


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
    data: { type: 'professor' },
};


test('should render calendar with time blocks', () => {
    const courses = [{ id: '1', data: { periods: [{ start: 60, end: 120, dayIndex: 1 }] } }];
    const assignments = [{ id: '1', data: { dueDate: '2024-11-15T10:00:00Z' } }];
    const todos = [{ id: '1', data: { dueDate: '2024-11-15T10:00:00Z' } }];
    const date = new Date('2024-11-15T00:00:00Z');

    render(<Calendar courses={[]} assignments={[]} todos={[]} type={undefined} date={new Date()} />);

    // Vérifier que les blocs horaires sont rendus
    expect(screen.getByText('10:00'));
});
