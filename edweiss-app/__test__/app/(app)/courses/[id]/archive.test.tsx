/**
 * @file archive.test.tsx
 * @description Test file for the archive screen
 * @author Florian Dinant
 */

import ArchiveScreen from '@/app/(app)/courses/[id]/archive';
import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { render } from "@testing-library/react-native";
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


// ------------------------------------------------------------------------------------------
// --------------------------------------  Mocks  -------------------------------------------
// ------------------------------------------------------------------------------------------

// Mock View component
jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

// Mock Text component
jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

// Mock Icon component
jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});

// Mock TouchableOpacity component
jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});

// Mock ScrollView component
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'course:dateFormat') return 'en-US';
        else if (str === 'course:previous_assignment_title') return 'Previous assignments';
        else if (str === 'course:archived_assignments') return 'Archived Assignments';
        else if (str === 'course:no_past_assignment') return 'No past assignments for the moment';
        else return str;
    })
);

// Mock CollectionOf
jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(() => 'mocked-collection'),
}));

// Mock useLocalSearchParams
jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useLocalSearchParams: jest.fn(),
}));

// Mock AssignmentDisplay component
jest.mock('@/components/core/header/RouteHeader', () => {
    const { Text } = require('react-native');
    return ({ title }: { title: string }) => <Text>{title}</Text>;
});

// Mock AssignmentDisplay component
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


// ------------------------------------------------------------------------------------------
// --------------------------------------  Tests  -------------------------------------------
// ------------------------------------------------------------------------------------------

describe('ArchiveScreen', () => {

    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders archived assignments", async () => {

        // Mock assignments
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

        // Mock useLocalSearchParams to return the assignments
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            rawAssignments: JSON.stringify(assignments)  // Simule la chaîne JSON des assignments
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

        // Mock useLocalSearchParams to return the assignments
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            rawAssignments: JSON.stringify(assignments)  // Simulate the JSON string of the assignments
        });

        const screen = render(<ArchiveScreen />);


        // Texts presence check
        expect(screen.getByText('Previous assignments')).toBeTruthy();
        expect(screen.getByText('Archived Assignments')).toBeTruthy();
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();

        // TestIDs presence check
        expect(screen.getByTestId('archive-scroll-view')).toBeTruthy();
        expect(screen.getByTestId('archive-touchable')).toBeTruthy();
        expect(screen.getByTestId('archive-icon')).toBeTruthy();
        expect(screen.getByTestId('archive-title')).toBeTruthy();
        expect(screen.getByTestId('no-archive')).toBeTruthy();

        // TestIDs absence check
        expect(screen.queryByTestId('assignment-view')).toBeNull();

    });

    test("renders nothing when rawAssignments is a string but is invalid", async () => {

        // Mock console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock useLocalSearchParams to return invalid rawAssignments
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            rawAssignments: "invalid"  // A non-valid JSON string that will fail to deserialize
        });

        // Render the ArchiveScreen component
        const screen = render(<ArchiveScreen />);

        // Verfies that the assignments are not displayed
        expect(screen.queryByText('Assignment 1')).toBeNull();
        expect(screen.queryByText('Assignment 2')).toBeNull();


        // Verifies that console.error has been called with the right message
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse rawAssignments: ', expect.any(Error));
        consoleErrorSpy.mockRestore();

        // Verifies that a no data message is maybe displayed
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();

    });

    test("renders nothing when rawAssignments is an empty string", async () => {

        // Mock console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock useLocalSearchParams to return an empty rawAssignments
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            rawAssignments: ""  // Une chaîne non-JSON valide qui va échouer à la déserialization
        });

        // Rennder the ArchiveScreen component
        const screen = render(<ArchiveScreen />);

        // Verifies that the assignments are not displayed
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to parse rawAssignments: ', expect.any(Error));
        consoleErrorSpy.mockRestore();

        // Verifies that a no data message is maybe displayed
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();
    });

    test("renders nothing when rawAssignments is not a string", async () => {

        // Mock console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        // Mock useLocalSearchParams to return an invalid rawAssignments
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            rawAssignments: 0  // Une chaîne non-JSON valide qui va échouer à la déserialization
        });

        // Render the ArchiveScreen component
        const screen = render(<ArchiveScreen />);

        // Verifies that the assignments are not displayed
        expect(consoleErrorSpy).toHaveBeenCalledWith('Invalid rawAssignments (not a string): ', 0);
        consoleErrorSpy.mockRestore();

        // Verifies that a no data message is maybe displayed
        expect(screen.getByText('No past assignments for the moment')).toBeTruthy();
    });
});
