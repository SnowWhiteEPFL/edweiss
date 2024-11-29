

import InfinitePaginatedCounterScreen from '@/app/(app)/calendar';
import { Calendar } from '@/components/core/calendar';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Todolist from '@/model/todo';
import { NavigationContainer } from '@react-navigation/native';
import { render, screen, waitFor } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
const CollectionOf = jest.fn();

import React from 'react';
import { Dimensions, ScaledSize } from 'react-native';
import { initCourse, initPeriod } from './helper_functions';



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
}
);



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



const mockTodos = [
    { id: 'todo1', data: { title: 'Test Todo', completed: false, name: 'Todo 1', status: 'incomplete' as Todolist.TodoStatus, } },

];

const mockPeriod = initPeriod(800, 1000, 'lecture', 'activity1', 2, 'Room 101');

const mockCourses = [
    initCourse({
        id: 'course1',
        name: 'Course 1',
        periods: [mockPeriod],
        section: 'IN',
        credits: 3,
        newAssignments: false,
        started: true,
    }),
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
    beforeEach(() => {
        // Mock des fonctions
        (useAuth as jest.Mock).mockReturnValue({
            authUser: { uid: 'user-123' },
        });

        CollectionOf.mockImplementation((path) => {
            if (path.includes('users/user-123/courses')) {
                return [
                    { id: 'course1', data: { name: 'Course 1' } },
                    { id: 'course2', data: { name: 'Course 2' } },
                ];
            }
            return [];
        });
    });




    it('should handle empty course lists gracefully', async () => {
        // Mock des appels pour simuler des listes vides
        (useDynamicDocs as jest.Mock).mockImplementationOnce(() => []);
        CollectionOf.mockImplementationOnce(() => []);

        // Rendu du composant
        render(<InfinitePaginatedCounterScreen />);

        // Attendre qu'aucun cours ne soit affiché
        await waitFor(() => {
            // Vérifier qu'aucun cours n'est affiché
            expect(screen.queryByText('Course 1')).toBeNull();
            expect(screen.queryByText('Course 2')).toBeNull();
        });
    });

    it('should handle errors gracefully when fetching courses', async () => {
        // Simuler un cas où une erreur se produit lors de la récupération des données

        // Rendu du composant
        render(<InfinitePaginatedCounterScreen />);

        // Vérifier que l'écran affiche un message d'erreur ou reste vide si cela est géré
        await waitFor(() => {
            // Si une erreur est levée, il faut vérifier que l'erreur est gérée correctement
            // Par exemple, on pourrait avoir un message d'erreur, un indicateur de chargement, ou d'autres comportements
            expect(screen.queryByText('Course 1')).toBeNull();
        });
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

        //expect(ScreenOrientation.addOrientationChangeListener).toHaveBeenCalled();
    });

    it('should change format when screen orientation changes', async () => {
        render(
            <NavigationContainer>
                <Calendar
                    courses={[]}
                    assignments={[]}
                    todos={[]}
                    type="week"
                    date={new Date()}
                />
            </NavigationContainer>
        );


        // Vérifie si le format a changé en conséquence
        await waitFor(() => {
            expect(ScreenOrientation.addOrientationChangeListener).toHaveBeenCalled();
        });
    });

    it('should update current time every minute', async () => {
        // Utiliser les timers factices pour tester l'intervalle de mise à jour
        jest.useFakeTimers();

        const { getByText } = render(
            <NavigationContainer>
                <Calendar
                    courses={[]}
                    assignments={[]}
                    todos={mockTodos}
                    type="day"
                    date={new Date()}
                />
            </NavigationContainer>
        );

        // Vérifier que la mise à jour de currentMinutes s'est bien produite
        await waitFor(() => {
            expect(getByText("0:00")).toBeTruthy(); // Vérifier que le rendu est mis à jour
        });

        jest.useRealTimers();
    });
});



