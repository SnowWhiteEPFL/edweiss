import ArchiveScreen from '@/app/(app)/courses/[id]/archive';
import TView from '@/components/core/containers/TView';
import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { render } from "@testing-library/react-native";
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


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
        else {
            return str;
        }
    })
);

jest.mock('@react-native-async-storage/async-storage', () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'));

jest.mock('firebase/app', () => ({
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                get: jest.fn(),
                set: jest.fn(),
                update: jest.fn(),
            })),
        })),
    })),
}));

jest.mock('../../../hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
    useDynamicDocs: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(() => 'mocked-collection'),
}));

jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useLocalSearchParams: jest.fn(),
}));

jest.mock('../../../components/core/header/RouteHeader', () => {
    const { Text } = require('react-native');
    return ({ title }: { title: string }) => <Text>{title}</Text>;
});

jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});

describe('ArchiveScreen', () => {

    beforeEach(() => {
        // Réinitialiser les appels et les configurations avant chaque test
        jest.clearAllMocks();
    });

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

        // Simule l'extraction de `extraInfo` via useLocalSearchParams
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            extraInfo: JSON.stringify(assignments)  // Simule la chaîne JSON des assignments
        });

        const screen = render(<ArchiveScreen />);

        //Checks

        // Texts presence check
        expect(screen.getByText('Previous assignments')).toBeTruthy();
        expect(screen.getByText('Archived Assignments')).toBeTruthy();
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Assignment 2')).toBeTruthy();
        expect(screen.getByText('Thursday, January 1')).toBeTruthy();
        expect(screen.getByText('Friday, January 2')).toBeTruthy();

        // Texts absence check
        expect(screen.queryByText('No past assignments for the moment')).toBeNull();

        // TestIDs presence check
        expect(screen.getByTestId('archive-scroll-view')).toBeTruthy();
        expect(screen.getByTestId('archive-touchable')).toBeTruthy();
        expect(screen.getByTestId('archive-icon')).toBeTruthy();
        expect(screen.getByTestId('archive-title')).toBeTruthy();
        expect(screen.getAllByTestId('assignment-view')).toHaveLength(2);

        // TestIDs absence check
        expect(screen.queryByTestId('no-archive')).toBeNull();
    });

    test("renders nothing when no assignment is given", async () => {
        const assignments: AssignmentWithColor[] = [];

        // Simule l'extraction de `extraInfo` via useLocalSearchParams
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            extraInfo: JSON.stringify(assignments)  // Simule la chaîne JSON des assignments
        });

        const screen = render(<ArchiveScreen />);


        // Texts presence check
        expect(screen.getByText('Previous assignments')).toBeTruthy();
        expect(screen.getByText('Archived Assignments')).toBeTruthy();
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();

        // Texts absence check


        // TestIDs presence check
        expect(screen.getByTestId('archive-scroll-view')).toBeTruthy();
        expect(screen.getByTestId('archive-touchable')).toBeTruthy();
        expect(screen.getByTestId('archive-icon')).toBeTruthy();
        expect(screen.getByTestId('archive-title')).toBeTruthy();
        expect(screen.getByTestId('no-archive')).toBeTruthy();

        // TestIDs absence check
        expect(screen.queryByTestId('assignment-view')).toBeNull();

    });

    test("renders nothing when extraInfo is a string but is invalid", async () => {

        // Crée un mock pour console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Simule l'extraction d'un extraInfo invalide via useLocalSearchParams
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            extraInfo: "invalid"  // Une chaîne non-JSON valide qui va échouer à la déserialization
        });

        // Rends le composant ArchiveScreen
        const screen = render(<ArchiveScreen />);

        // Vérifie que les assignments ne sont pas affichés
        expect(screen.queryByText('Assignment 1')).toBeNull();
        expect(screen.queryByText('Assignment 2')).toBeNull();

        // Vérifie que console.error a bien été appelé avec le bon message
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse extraInfo: ', expect.any(Error));
        consoleErrorSpy.mockRestore();

        // Vérifie qu'un message d'absence de données est peut-être affiché
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();

    });

    test("renders nothing when extraInfo is an empty string", async () => {

        // Crée un mock pour console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Simule l'extraction d'un extraInfo invalide via useLocalSearchParams
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            extraInfo: ""  // Une chaîne non-JSON valide qui va échouer à la déserialization
        });

        // Rends le composant ArchiveScreen
        const screen = render(<ArchiveScreen />);

        // Vérifie que console.error a bien été appelé avec le bon message
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse extraInfo: ', expect.any(Error));
        consoleErrorSpy.mockRestore();

        // Vérifie qu'un message d'absence de données est peut-être affiché
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();
    });

    test("renders nothing when extraInfo is not a string", async () => {

        // Crée un mock pour console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Simule l'extraction d'un extraInfo invalide via useLocalSearchParams
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            extraInfo: 0  // Une chaîne non-JSON valide qui va échouer à la déserialization
        });

        // Rends le composant ArchiveScreen
        const screen = render(<ArchiveScreen />);

        // Vérifie que console.error a bien été appelé avec le bon message
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid extraInfo (not a string): ', 0);
        consoleErrorSpy.mockRestore();

        // Vérifie qu'un message d'absence de données est peut-être affiché
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();
    });
});
