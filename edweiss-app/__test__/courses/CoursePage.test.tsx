import CoursePage from '@/app/(app)/courses/[id]/index';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { fireEvent, render } from "@testing-library/react-native";
import { router } from 'expo-router';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
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

// Mock t() function
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'course:dateFormat') return 'en-US';
        else if (str === 'course:upcoming_assignment_title') return 'Upcoming assignments';
        else if (str === 'course:previous_assignment_title') return 'Previous assignments';
        else if (str === 'course:no_assignment_due') return 'No assignments due for now';
        else if (str === 'course:this_week') return 'This Week';
        else return str;
    })
);

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
    useDynamicDocs: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(() => 'mocked-collection'),
}));

jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useLocalSearchParams: jest.fn(() => ({ id: 'default-id' })),
    router: {
        push: jest.fn(),
    },
}));

jest.mock('@/components/core/header/RouteHeader', () => {
    const { Text } = require('react-native');
    return ({ title }: { title: string }) => <Text>{title}</Text>;
});

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


describe('CoursePage with assignments', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { }); // Transforme `console.log` en une fonction mock
        (usePrefetchedDynamicDoc as jest.Mock).mockImplementation(() => [{
            id: "courseID",
            data: {
                name: "Swent",
                description: "This is a mocked course description",
                professors: ["TeacherID"],
                assistants: ["StudentID"],
                periods: [],
                section: "IN",
                credits: 8,
                started: true,
            },
        }]);

        (useDynamicDocs as jest.Mock).mockImplementation(() => [
            {
                id: "assignmentID_1",
                data: {
                    name: "Assignment 1",
                    type: "quiz",
                    dueDate: { seconds: 1735689600, nanoseconds: 0 },
                    color: "red",
                },
            },
            {
                id: "assignmentID_2",
                data: {
                    name: "Assignment 2",
                    type: "quiz",
                    dueDate: { seconds: 1735689600 + 86400, nanoseconds: 0 },
                    color: "blue",
                },
            },
        ]);
    });

    // Mock `console.log`
    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialise les mocks pour les prochains tests
    });


    test("renders course with assignments", async () => {
        // const assignments: AssignmentWithColor[] = [
        //     {
        //         name: "Assignment 1",
        //         type: "quiz",
        //         dueDate: { seconds: 2000, nanoseconds: 0 },
        //         color: "red"
        //     },
        //     {
        //         name: "Assignment 2",
        //         type: "quiz",
        //         dueDate: { seconds: 86400 + 2000, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
        //         color: "blue"
        //     }
        // ];

        const screen = render(<CoursePage />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Swent')).toBeTruthy();
        expect(screen.getByText('Wednesday, January 1')).toBeTruthy();
        expect(screen.getByText('Thursday, January 2')).toBeTruthy();
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Assignment 2')).toBeTruthy();
        expect(screen.getByText('Upcoming assignments')).toBeTruthy();
        expect(screen.getByText('Previous assignments')).toBeTruthy();
        expect(screen.getByText('This Week')).toBeTruthy();
        expect(screen.getByText('Slides')).toBeTruthy();
        expect(screen.getByText('Exercises')).toBeTruthy();
        expect(screen.getByText('Feedbacks')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('No assignments due for now')).toBeNull();

        //Test IDs presence check
        expect(screen.getByTestId('scroll-view')).toBeTruthy();
        expect(screen.getByTestId('upcoming-assignments')).toBeTruthy();
        expect(screen.getAllByTestId('assignment-view')).toHaveLength(2);
        expect(screen.getByTestId('previous-assignments')).toBeTruthy();
        expect(screen.getByTestId('this-week-title')).toBeTruthy();
        expect(screen.getByTestId('this-week-text')).toBeTruthy();
        expect(screen.getByTestId('slides-text')).toBeTruthy();
        expect(screen.getByTestId('exercises-text')).toBeTruthy();
        expect(screen.getByTestId('feedbacks-text')).toBeTruthy();
        expect(screen.getByTestId('slides-icon')).toBeTruthy();
        expect(screen.getByTestId('exercises-icon')).toBeTruthy();
        expect(screen.getByTestId('feedbacks-icon')).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId('no-assignment-due')).toBeNull();

        //Fire events
        fireEvent.press(screen.getByTestId('slides-touchable'));
        expect(console.log).toHaveBeenCalledWith('Go to Slides');
        fireEvent.press(screen.getByTestId('exercises-touchable'));
        expect(console.log).toHaveBeenCalledWith('Go to Exercises');
        fireEvent.press(screen.getByTestId('feedbacks-touchable'));
        expect(console.log).toHaveBeenCalledWith('Go to Feedbacks');
    });
});

describe("CoursePage without assignments", () => {
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { }); // Transforme `console.log` en une fonction mock
        (usePrefetchedDynamicDoc as jest.Mock).mockImplementation(() => [{
            id: "courseID",
            data: {
                name: "Swent",
                description: "This is a mocked course description",
                professors: ["TeacherID"],
                assistants: ["StudentID"],
                periods: [],
                section: "IN",
                credits: 8,
                started: true,
            },
        }]);

        // Mock sans assignments
        (useDynamicDocs as jest.Mock).mockImplementation(() => []);
    });

    // Mock `console.log`
    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialise les mocks pour les prochains tests
    });

    test("renders no assignments", async () => {

        const screen = render(<CoursePage />);

        //Check if the assignment name and date are rendered
        expect(screen.getByText('No assignments due for now')).toBeTruthy();
        expect(screen.getByText('Upcoming assignments')).toBeTruthy();
        expect(screen.getByText('Previous assignments')).toBeTruthy();
        expect(screen.getByText('This Week')).toBeTruthy();
        expect(screen.getByText('Slides')).toBeTruthy();
        expect(screen.getByText('Exercises')).toBeTruthy();
        expect(screen.getByText('Feedbacks')).toBeTruthy();

        //Test IDs presence check
        expect(screen.getByTestId('scroll-view')).toBeTruthy();
        expect(screen.getByTestId('upcoming-assignments')).toBeTruthy();
        expect(screen.getByTestId('no-assignment-due')).toBeTruthy();
        expect(screen.getByTestId('previous-assignments')).toBeTruthy();
        expect(screen.getByTestId('this-week-title')).toBeTruthy();
        expect(screen.getByTestId('this-week-text')).toBeTruthy();
        expect(screen.getByTestId('slides-text')).toBeTruthy();
        expect(screen.getByTestId('exercises-text')).toBeTruthy();
        expect(screen.getByTestId('feedbacks-text')).toBeTruthy();
        expect(screen.getByTestId('slides-icon')).toBeTruthy();
        expect(screen.getByTestId('exercises-icon')).toBeTruthy();
        expect(screen.getByTestId('feedbacks-icon')).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId('assignment-view')).toBeNull();

        //Fire events
        fireEvent.press(screen.getByTestId('slides-touchable'));
        expect(console.log).toHaveBeenCalledWith('Go to Slides');
        fireEvent.press(screen.getByTestId('exercises-touchable'));
        expect(console.log).toHaveBeenCalledWith('Go to Exercises');
        fireEvent.press(screen.getByTestId('feedbacks-touchable'));
        expect(console.log).toHaveBeenCalledWith('Go to Feedbacks');
    });
});

describe('Navigate to PreviousPage', () => {

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => { });

        // Mock des données de cours
        (usePrefetchedDynamicDoc as jest.Mock).mockImplementation(() => [{
            id: "course-id-123", // ID du cours
            data: {
                name: "Course 101",
                description: "This is a mocked course description",
                professors: ["TeacherID"],
                assistants: ["StudentID"],
                periods: [],
                section: "IN",
                credits: 8,
                started: true,
            },
        }]);

        // Mock des assignments
        (useDynamicDocs as jest.Mock).mockImplementation(() => [
            {
                id: "assignmentID_1",
                data: {
                    name: "Assignment 1",
                    type: "quiz",
                    dueDate: { seconds: 0, nanoseconds: 0 },
                },
            },
            {
                id: "assignmentID_2",
                data: {
                    name: "Assignment 2",
                    type: "quiz",
                    dueDate: { seconds: 86400, nanoseconds: 0 },
                },
            },
        ]);
    });

    test('should navigate to the archive page with correct params when the button is clicked', () => {

        // Render the CoursePage component
        const screen = render(
            <CoursePage />
        );

        // Spy sur router.push
        const pushSpy = jest.spyOn(router, 'push');

        // Trouve le bouton TouchableOpacity par testID
        const button = screen.getByTestId('navigate-to-archive-button');

        // Simule un clic sur le bouton
        fireEvent.press(button);

        // Vérifie que router.push a bien été appelé avec les bons paramètres
        expect(pushSpy).toHaveBeenCalledWith({
            pathname: '/courses/[id]/archive',
            params: {
                id: 'course-id-123',  // Vérifie que l'ID est bien celui du cours
                extraInfo: JSON.stringify([
                    {
                        name: "Assignment 2",
                        type: "quiz",
                        dueDate: { seconds: 86400, nanoseconds: 0 },
                        color: "darkNight",
                    },
                    {
                        name: "Assignment 1",
                        type: "quiz",
                        dueDate: { seconds: 0, nanoseconds: 0 },
                        color: "darkNight"
                    }
                ]),
            },
        });

        // Nettoyage après test
        pushSpy.mockRestore();
    });
});