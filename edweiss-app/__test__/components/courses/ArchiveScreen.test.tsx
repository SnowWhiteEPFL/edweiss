import TView from '@/components/core/containers/TView';
import ArchiveScreen from '@/components/courses/ArchiveScreen';
import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { render } from "@testing-library/react-native";
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


// Création du mock pour callFunction
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
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

jest.mock('@/config/i18config', () => jest.fn(() => 'en-US'));

describe('ArchiveScreen', () => {
    test("renders archived assignments", async () => {
        const assignments: AssignmentWithColor[] = [
            {
                name: "Assignment 1",
                type: "quiz",
                dueDate: { seconds: 2000, nanoseconds: 0 },
                color: "red"
            },
            {
                name: "Assignment 2",
                type: "quiz",
                dueDate: { seconds: 86400 + 2000, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
                color: "blue"
            }
        ];

        const screen = render(<ArchiveScreen assignments={assignments} />);

        //Check if the assignment name and date are rendered
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Assignment 2')).toBeTruthy();
        expect(screen.getByText('Thursday, January 1')).toBeTruthy();
        expect(screen.getByText('Friday, January 2')).toBeTruthy();

        expect(screen.getByTestId('archive-scroll-view')).toBeTruthy();
        expect(screen.getByTestId('archive-title')).toBeTruthy();
    });

    test("renders nothing", async () => {
        const assignments: AssignmentWithColor[] = [];

        const screen = render(<ArchiveScreen assignments={assignments} />);

        //Check if the assignment name and date are rendered
        expect(screen.getByTestId('archive-scroll-view')).toBeTruthy();
        expect(screen.getByTestId('no-archive')).toBeTruthy();
    });
});

// import ArchiveScreen from '@/components/courses/ArchiveScreen';
// import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
// import { NavigationContainer } from '@react-navigation/native';
// import { render } from "@testing-library/react-native";
// import React from 'react';
// import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


// // Création du mock pour callFunction
// jest.mock('@/config/firebase', () => ({
//     callFunction: jest.fn(),
// }));

// jest.mock("expo-router", () => ({
//     useNavigation: jest.fn(),
//     useRouter: jest.fn(),
//     useSegments: jest.fn(),
//     Stack: ({ children }: { children: React.ReactNode }) => <>{children}</>,
//     Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
// }));

// jest.mock('@react-native-firebase/auth', () => ({
//     // Mock Firebase auth methods you use in your component
//     signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' } })),
//     signOut: jest.fn(() => Promise.resolve()),
//     currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
// }));

// jest.mock('@react-native-firebase/firestore', () => { // this one does not work yet.
//     const mockCollection = jest.fn(() => ({
//         doc: jest.fn(() => ({
//             set: jest.fn(() => Promise.resolve()),
//             get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
//         })),
//     }));

//     return {
//         firestore: jest.fn(() => ({
//             collection: mockCollection,  // Mock collection method
//         })),
//         collection: mockCollection,  // Also expose it directly for other uses
//     };
// });

// // Mock Firebase Functions
// jest.mock('@react-native-firebase/functions', () => ({
//     httpsCallable: jest.fn(() => () => Promise.resolve({ data: 'function response' })),
// }));

// // Mock Firebase Storage
// jest.mock('@react-native-firebase/storage', () => ({
//     ref: jest.fn(() => ({
//         putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
//         getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.png')),
//     })),
// }));
// jest.mock('@/contexts/auth', () => ({
//     useAuth: jest.fn(),					// mock authentication
// }));

// jest.mock('react-native/Libraries/Settings/Settings', () => ({
//     get: jest.fn(),
//     set: jest.fn(),
// }));
// jest.mock('@react-native-google-signin/google-signin', () => ({ // mock google sign-in
//     GoogleSignin: {
//         configure: jest.fn(),
//         hasPlayServices: jest.fn(() => Promise.resolve(true)),
//         signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
//         signOut: jest.fn(() => Promise.resolve()),
//         isSignedIn: jest.fn(() => Promise.resolve(true)),
//         getTokens: jest.fn(() => Promise.resolve({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
//     },
// }));

// jest.mock('@react-native-async-storage/async-storage', () => ({
//     setItem: jest.fn(),
//     getItem: jest.fn(),
//     removeItem: jest.fn(),
// }));
// jest.mock('react-native-toast-message', () => ({
//     show: jest.fn(),
// }));
// jest.mock('../../../components/core/containers/TView.tsx', () => {
//     const { View } = require('react-native');
//     return (props: ViewProps) => <View {...props} />;
// });
// jest.mock('../../../components/core/TText.tsx', () => {
//     const { Text } = require('react-native');
//     return (props: TextProps) => <Text {...props} />;
// });
// jest.mock('../../../components/core/containers/TTouchableOpacity.tsx', () => {
//     const { TouchableOpacity, View } = require('react-native');
//     return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
//         <TouchableOpacity {...props}>
//             <View>{props.children}</View>
//         </TouchableOpacity>
//     );
// });

// Mock the i18n translation function and locale
// jest.mock('@/config/i18config', () => jest.fn(() => 'en-US'));

// describe('ArchiveScreen', () => {
//     test("renders archived assignments", async () => {
//         const assignments: AssignmentWithColor[] = [
//             {
//                 name: "Assignment 1",
//                 type: "quiz",
//                 dueDate: { seconds: 2000, nanoseconds: 0 },
//                 color: "red"
//             },
//             {
//                 name: "Assignment 2",
//                 type: "quiz",
//                 dueDate: { seconds: 86400 + 2000, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
//                 color: "blue"
//             }
//         ];

//         const screen = render(
//             <NavigationContainer>
//                 <ArchiveScreen assignments={assignments} />
//             </NavigationContainer>
//         );

//         //Check if the assignment name and date are rendered
//         expect(screen.getByText('Assignment 1')).toBeTruthy();
//         expect(screen.getByText('Assignment 2')).toBeTruthy();
//         expect(screen.getByText('Thursday, January 1')).toBeTruthy();
//         expect(screen.getByText('Friday, January 2')).toBeTruthy();

//         expect(screen.getByTestId('archive-scroll-view')).toBeTruthy();
//         expect(screen.getByTestId('archive-icon')).toBeTruthy();
//         expect(screen.getByTestId('archive-title')).toBeTruthy();
//     });
// });