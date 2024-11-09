import TView from '@/components/core/containers/TView';
import AssignmentDisplay, { AssignmentWithColor, saveTodo } from '@/components/courses/AssignmentDisplay';
import { fromDate } from '@/model/time';
import Todolist from '@/model/todo';
import { render } from "@testing-library/react-native";
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';
import Toast from 'react-native-toast-message';
import { callFunction } from '../../../config/firebase';

jest.mock('@/model/time', () => ({
    fromDate: jest.fn(),
}));

jest.mock('../../../config/firebase', () => ({
    callFunction: jest.fn(),
    getFunction: jest.fn(),
}));
jest.mock('@react-native-firebase/auth', () => ({
    // Mock Firebase auth methods you use in your component
    signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
}));

jest.mock('@react-native-firebase/firestore', () => { // this one does not work yet.
    const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
            set: jest.fn(() => Promise.resolve()),
            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
        })),
    }));

    return {
        firestore: jest.fn(() => ({
            collection: mockCollection,  // Mock collection method
        })),
        collection: mockCollection,  // Also expose it directly for other uses
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
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useLocalSearchParams: jest.fn(() => ({ id: 'default-id' })),
    router: {
        push: jest.fn(),
    },
}));

jest.mock('../../../components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});
jest.mock('../../../components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});
jest.mock('../../../components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});

// jest.mock('react-native-gesture-handler', () => {
//     return {
//         Swipeable: jest.fn().mockImplementation(({ children, testID, renderRightActions, onSwipeableOpen }) => {
//             const { View } = require('react-native');
//             return (
//                 <View testID={testID}>
//                     {children}
//                 </View>
//             );
//         }),
//     };
// });

jest.doMock('react-native-gesture-handler', () => {
    return {
        Swipeable: ({ onSwipeableOpen, children }: { onSwipeableOpen: Function, children: React.ReactNode; }) => {
            return (
                <TView
                    data-testid="swipe-component"
                    onTouchStart={() => {
                        if (onSwipeableOpen) {
                            onSwipeableOpen('right'); // Simuler un swipe à droite
                        }
                    }}
                >
                    {children}
                </TView>
            );
        }
    };
});

// jest.doMock('react-native-gesture-handler', () => {
//     return {
//         Swipeable: ({ item, index, isSwipeable, renderRightActions, children }: { item: any, index: number, isSwipeable: boolean, renderRightActions: Function, children: React.ReactNode }) => {
//             if (isSwipeable) {
//                 return (
//                     <TView
//                         data-testid="swipeable-component"
//                         onTouchStart={() => {
//                             // Simuler un swipe à droite pour tester onSwipeableOpen
//                             renderRightActions(); // Appeler renderRightActions
//                         }}
//                     >
//                         {children}
//                     </TView>
//                 );
//             }
//             return <TView>{children}</TView>;
//         }
//     };
// });

// jest.mock('react-native-gesture-handler', () => {
//     const originalModule = jest.requireActual('react-native-gesture-handler');

//     return {
//         ...originalModule,
//         Swipeable: ({
//             renderRightActions,
//             children
//         }: {
//             renderRightActions?: () => React.ReactNode;  // ou tout autre type spécifique que tu utilises
//             children: React.ReactNode;
//         }) => {
//             return (
//                 <originalModule.View
//                     testID="swipeable-component"
//                     onTouchStart={() => {
//                         // Simuler un swipe à droite
//                         if (renderRightActions) {
//                             renderRightActions();  // appelle renderRightActions si défini
//                         }
//                     }}
//                 >
//                     {children}
//                 </originalModule.View>
//             );
//         }
//     };
// });

jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'course:dateFormat') {
            return 'en-US';
        }
        else if (str === 'course:upcoming_assignment_title') {
            return 'Upcoming assignments';
        }
        else if (str === 'course:previous_assignment_title') {
            return 'Previous assignments';
        }
        else if (str === 'course:no_assignment_due') {
            return 'No assignments due for now';
        }
        else if (str === 'course:add_to_todo') {
            return 'Add to To-Do';
        }
        else if (str === 'course:this_week') {
            return 'This Week';
        }
        else if (str === 'course:toast_added_to_todo_text1') {
            return 'Assignment added to To-Do list';
        }
        else if (str === 'course:toast_added_to_todo_text2') {
            return 'Now you have a new reason to procrastinate! 🎉';
        }
        else if (str === 'course:archived_assignments') {
            return 'Archived Assignments';
        }
        else if (str === 'course:no_past_assignment') {
            return 'No past assignments for the moment';
        }
        else if (str === 'todo:error_toast_title') {
            return 'Error message title';
        }
        else if (str === 'todo:couldnot_save_toast') {
            return 'Could not save todo';
        }
        else {
            return str;
        }
    })
);

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});


// Mock des valeurs nécessaires
const mockToast = Toast.show as jest.Mock;

describe('AssignmentDisplay', () => {

    beforeEach(() => {
        // Mock de Timestamp.fromDate pour chaque test
        (fromDate as jest.Mock).mockReturnValue({ seconds: 12345, nanoseconds: 0 });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test("renders assignment information and handles swipe", async () => {

        //const renderRightActionsMock = jest.fn();

        const assignment: AssignmentWithColor = {
            name: "Assignment 1",
            type: "quiz",
            dueDate: { seconds: 2000, nanoseconds: 0 },
            color: "red"
        };

        const screen = render(
            <AssignmentDisplay
                item={assignment}
                index={0}
                isSwipeable={true}
            />
        );

        //Check if the assignment name and date are rendered
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Thursday, January 1')).toBeTruthy();
        expect(screen.getByText('Add to To-Do')).toBeTruthy();

        expect(screen.getByTestId('swipeable-component')).toBeTruthy();
        expect(screen.getByTestId('assignment-view')).toBeTruthy();
        expect(screen.getByTestId('assignment-touchable')).toBeTruthy();
        expect(screen.getByTestId('assignment-icon')).toBeTruthy();
        expect(screen.getByTestId('assignment-title-view')).toBeTruthy();
        expect(screen.getByTestId('assignment-title')).toBeTruthy();
        expect(screen.getByTestId('assignment-date')).toBeTruthy();

        expect(screen.getByTestId('swipe-view')).toBeTruthy();
        expect(screen.getByTestId('add-to-todo-text')).toBeTruthy();

        // Fire swipe event
        // Ici, nous injectons renderRightActions à travers le mock de Swipeable
        // const swipeableComponent = screen.getByTestId('swipeable-component');

        // // Simuler un événement de touchstart pour activer le swipe
        // fireEvent(swipeableComponent, 'touchstart');

        // // Vérifie que renderRightActionsMock a été appelé (mimique du comportement de swipe)
        // expect(renderRightActionsMock).toHaveBeenCalled();
    });

    test("renders assignment information and is not swipeable", async () => {
        const assignment: AssignmentWithColor = {
            name: "Assignment 1",
            type: "quiz",
            dueDate: { seconds: 2000, nanoseconds: 0 },
            color: "red"
        };

        const screen = render(
            <AssignmentDisplay
                item={assignment}
                index={0}
                isSwipeable={false}
            />
        );

        //Check if the assignment name and date are rendered
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Thursday, January 1')).toBeTruthy();

        expect(screen.getByTestId('assignment-view')).toBeTruthy();
        expect(screen.getByTestId('assignment-touchable')).toBeTruthy();
        expect(screen.getByTestId('assignment-icon')).toBeTruthy();
        expect(screen.getByTestId('assignment-title-view')).toBeTruthy();
        expect(screen.getByTestId('assignment-title')).toBeTruthy();
        expect(screen.getByTestId('assignment-date')).toBeTruthy();
    });

    it('should successfully save a todo and show success toast', async () => {
        // Mock du comportement de callFunction (réussite)
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });

        // Appel de la fonction saveTodo
        const name = 'Test Todo';
        const dueDate = fromDate(new Date());
        const description = 'Test Description';

        saveTodo(name, dueDate, description);

        // Vérifier si callFunction a été appelé avec les bons arguments
        expect(callFunction as jest.Mock).toHaveBeenCalledWith(Todolist.Functions.createTodo, {
            name,
            description,
            dueDate: expect.any(String), // Vérifier que la date est bien formatée en ISO
            status: 'yet',
        });

        // Vérifier si le toast de succès a été affiché
        expect(mockToast).toHaveBeenCalledWith({
            type: 'success',
            text1: 'Success message text1', // Remplace par la valeur correcte dans t()
            text2: 'Success message text2', // Remplace par la valeur correcte dans t()
        });
    });

    it('should show error toast if callFunction fails', async () => {
        // Mock du comportement de callFunction (échec)
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: false });

        const name = 'Test Todo';
        const dueDate = fromDate(new Date());
        const description = 'Test Description';

        await saveTodo(name, dueDate, description);

        // Vérifier si callFunction a été appelé
        expect(callFunction as jest.Mock).toHaveBeenCalled();

        // Vérifier si le toast d'erreur a été affiché
        expect(mockToast).toHaveBeenCalledWith({
            type: 'error',
            text1: 'Error message title', // Remplace par la valeur correcte dans t()
            text2: 'Could not save todo', // Remplace par la valeur correcte dans t()
        });
    });

    it('should handle exceptions and show error toast', async () => {
        // Simuler une erreur dans la fonction saveTodo
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error('Some error'));

        const name = 'Test Todo';
        const dueDate = fromDate(new Date());
        const description = 'Test Description';

        await saveTodo(name, dueDate, description);

        // Vérifier si le toast d'erreur a été affiché en cas d'exception
        expect(mockToast).toHaveBeenCalledWith({
            type: 'error',
            text1: 'Error message title', // Remplace par la valeur correcte dans t()
            text2: 'Could not save todo', // Remplace par la valeur correcte dans t()
        });
    });
});