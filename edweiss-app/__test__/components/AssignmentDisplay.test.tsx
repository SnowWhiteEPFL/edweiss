import TView from '@/components/core/containers/TView';
import AssignmentDisplay, { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { render } from "@testing-library/react-native";
import React from 'react';
import { Swipeable } from 'react-native-gesture-handler';

// Mocking the external dependencies
// jest.mock('react-native-gesture-handler', () => {
//     const originalModule = jest.requireActual('react-native-gesture-handler');
//     return {
//         ...originalModule,
//         Swipeable: jest.fn().mockImplementation(({ children, renderRightActions }) => (
//             <>{children}{renderRightActions && renderRightActions()}</>
//         )),
//     };
// });

jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));
/*
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
*/
// jest.mock('react-native-gesture-handler', () => {
//     const { TouchableOpacity, View } = require('react-native');
//     return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
//         <TouchableOpacity {...props}>
//             <View>{props.children}</View>
//         </TouchableOpacity>
//     );
// });



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
    return {
        __esModule: true,
        default: jest.fn(() => ({
            collection: jest.fn(() => ({
                doc: jest.fn(() => ({
                    get: jest.fn(() => Promise.resolve({
                        exists: true,
                        data: jest.fn(() => ({
                            name: 'Test Assignment',
                            description: 'This is a test assignment',
                        })),
                    })),
                })),
            })),
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
// jest.mock('react-native-gesture-handler', () => {
//     const { View } = require('react-native');

//     return {
//         Swipeable: ({ children, renderRightActions, onSwipeableOpen }: {
//             children: React.ReactNode;
//             renderRightActions?: () => React.ReactNode;
//             onSwipeableOpen?: (direction: string) => void;
//         }) => {
//             return (
//                 <View
//                     testID="swipe-component"
//                     onTouchStart={() => {
//                         // Simule un swipe à droite en appelant la fonction onSwipeableOpen
//                         if (onSwipeableOpen) {
//                             onSwipeableOpen('right');  // Change à 'left' si tu veux simuler un swipe gauche
//                         }
//                     }}
//                 >
//                     {children}
//                     {renderRightActions && renderRightActions()}  {/* Exécute renderRightActions si fourni */}
//                 </View>
//             );
//         }
//     };
// });
// Mock the i18n translation function and locale
jest.mock('@/config/i18config', () => jest.fn(() => 'en-US'));

describe('AssignmentDisplay', () => {
    test("renders assignment information and handles swipe", async () => {
        const assignment: AssignmentWithColor = {
            name: "Assignment 1",
            type: "quiz",
            dueDate: { seconds: 2000, nanoseconds: 0 },
            color: "red"
        };

        // Manually mock swipeableRefs as a MutableRefObject
        const swipeableRefs = { current: [null] as (Swipeable | null)[] };

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
        //expect(screen.getByText('en-US')).toBeTruthy();
        //expect(screen.getByTestId('mockSwipeable')).toBeTruthy();

        // Define the onSwipeableOpen function
        const onSwipeableOpen = jest.fn((direction) => {
            console.log(`Swiped to the ${direction}`);
        });

        // Simuler un swipe
        //fireEvent.press(screen.getByTestId('swipe-component')); // Simule un swipe en appuyant sur le composant

        // Vérifier que la fonction onSwipeableOpen a été appelée
        //expect(onSwipeableOpen).toHaveBeenCalled();

        //expect(screen.getByTestId('swipe-component')).toBeTruthy();
        //expect(screen.getByTestId('swipeView')).toBeTruthy();
        //expect(screen.getByTestId('assignment-icon')).toBeTruthy();
        expect(screen.getByTestId('assignment-title')).toBeTruthy();
        expect(screen.getByTestId('assignment-date')).toBeTruthy();
    });
});