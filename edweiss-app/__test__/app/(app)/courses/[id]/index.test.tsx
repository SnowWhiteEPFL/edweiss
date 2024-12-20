import CoursePage from '@/app/(app)/courses/[id]/index';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import { useAuth } from '@/contexts/auth';
import { useDoc, useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { Timestamp } from '@/model/time';
import { ProfessorUser, StudentUser } from '@/model/users';
import { updateCourseAction, updateMaterialAction } from '@/utils/courses/coursesActionsFunctions';
import { fireEvent, render } from "@testing-library/react-native";
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';
import { PdfProps } from 'react-native-pdf';

jest.mock('@/utils/courses/coursesActionsFunctions', () => {
    return {
        updateCourseAction: jest.fn(),
        updateMaterialAction: jest.fn(),
    };
});

jest.mock('react-native-autoheight-webview', () => {
    const { View, Text } = require('react-native');
    return ({ source, style }: { source: { html?: string }, style: any }) => (
        <View style={style}>
            <Text testID="webview-content">{source?.html || 'No content'}</Text>
        </View>
    );
});

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
        else if (str === 'course:materials_title') return 'Materials';
        else if (str === 'course:hide_future_materials') return 'Hide future materials';
        else if (str === 'course:show_future_materials') return 'Show future materials';
        else return str;
    })
);

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));

const TeacherAuthMock = {
    authUser: { uid: 'TeacherID', name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn(),
};

const StudentAuthMock = {
    authUser: { uid: 'StudentID', name: 'Test User' },
    login: jest.fn(),
    logout: jest.fn(),
};

const setupTeacherMockUseAuth = (overrideValues = {}) => {
    (useAuth as jest.Mock).mockReturnValue({
        ...TeacherAuthMock,
        ...overrideValues, // Permet d'écraser les valeurs par défaut
    });
};

const setupStudentMockUseAuth = (overrideValues = {}) => {
    (useAuth as jest.Mock).mockReturnValue({
        ...StudentAuthMock,
        ...overrideValues, // Permet d'écraser les valeurs par défaut
    });
};


jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
    useDynamicDocs: jest.fn(),
    useDoc: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn((path: string) => {
        return path;
    }),
}));

jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useLocalSearchParams: jest.fn(),
    Redirect: jest.fn(() => null),
    router: {
        push: jest.fn(),
    },
}));

jest.mock('@/components/core/header/RouteHeader', () => {
    const { View, Text } = require('react-native');
    return ({ title, right }: { title: string, right: React.ReactNode | undefined }) => <View><Text>{title}</Text>{right}</View>;
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

jest.mock('@/components/core/TActivityIndicator', () => {
    return {
        __esModule: true,  // Ceci est nécessaire pour simuler un module ES6
        default: jest.fn(() => null), // On retourne une version mockée de TActivityIndicator qui ne rend rien
    };
});

//====================== Mock PDF ===========================
jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));
jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: PdfProps) => {
        const { onLoadComplete, onPageChanged } = props;

        React.useEffect(() => {
            if (onLoadComplete) {
                onLoadComplete(10, "1", { height: 100, width: 100 }, []); // Mock total pages as 10 with additional required arguments
            }
        }, [onLoadComplete]);

        React.useEffect(() => {
            if (onPageChanged) {
                onPageChanged(3, 10); // Mock current page as 1 and total pages as 10
            }
        }, [onPageChanged]);

        return React.createElement('Pdf', {
            ...props
        });
    };
});
//==========================================================


// Mock Date
const fixedDate = new Date('2025-01-01T00:02:00Z'); // 1st of January 2025

const date1 = new Date('2025-01-03T00:02:00Z'); // 3rd of January 2025
const seconds1 = Math.floor(date1.getTime() / 1000);

const date2 = new Date('2025-01-02T00:02:00Z'); // 2nd of January 2025
const seconds2 = Math.floor(date2.getTime() / 1000);

// Previous
const date3 = new Date('2024-12-16T06:00:00Z'); // 16th of December 2024 at 08:00:00 UTC+2
const seconds3 = Math.floor(date3.getTime() / 1000);
const date4 = new Date('2024-12-20T17:00:00Z'); // 20th of December 2024 at 19:00:00 UTC+2
const seconds4 = Math.floor(date4.getTime() / 1000);

// Current
const date5 = new Date('2024-12-30T06:00:00Z'); // 30th of December 2024 at 08:00:00 UTC+2
const seconds5 = Math.floor(date5.getTime() / 1000);
const date6 = new Date('2025-01-03T17:00:00Z'); // 3rd of January 2025 at 19:00:00 UTC+2
const seconds6 = Math.floor(date6.getTime() / 1000);

// Future
const date7 = new Date('2025-02-03T06:00:00Z'); // 3rd of February 2025 at 08:00:00 UTC+2
const seconds7 = Math.floor(date7.getTime() / 1000);
const date8 = new Date('2025-02-07T17:00:00Z'); // 7th of February 2025 at 19:00:00 UTC+2
const seconds8 = Math.floor(date8.getTime() / 1000);


describe('CoursePage with assignments', () => {

    beforeEach(() => {
        setupStudentMockUseAuth();
        (useDoc as jest.Mock).mockReturnValue({ id: 'StudentID', data: { type: 'student', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as StudentUser });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'default-id' });
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

        (useDynamicDocs as jest.Mock).mockImplementation((collectionPath) => {
            if (collectionPath.includes('assignments')) {
                return [
                    {
                        id: "assignmentID_1",
                        data: {
                            name: "Assignment 1",
                            type: "quiz",
                            dueDate: { seconds: seconds1, nanoseconds: 0 },
                            color: "red",
                        },
                    },
                    {
                        id: "assignmentID_2",
                        data: {
                            name: "Assignment 2",
                            type: "quiz",
                            dueDate: { seconds: seconds2, nanoseconds: 0 },
                            color: "blue",
                        },
                    },
                ];
            } else if (collectionPath.includes('materials')) {
                return [
                    {
                        id: "materialID_1",
                        data: {
                            title: "Material 1",
                            description: "Description of Material 1",
                            from: { seconds: seconds3, nanoseconds: 0 },
                            to: { seconds: seconds4, nanoseconds: 0 },
                            docs: [{ uri: "uri1", title: "Document 1", type: "slide" }, { uri: "uri1.1", title: "Document 1.1", type: "exercise" }],
                        },
                    },
                    {
                        id: "materialID_2",
                        data: {
                            title: "Material 2",
                            description: "Description of Material 2",
                            from: { seconds: seconds5, nanoseconds: 0 },
                            to: { seconds: seconds6, nanoseconds: 0 },
                            docs: [{ uri: "uri2", title: "Document 2", type: "exercise" }],
                        },
                    },
                    {
                        id: "materialID_3",
                        data: {
                            title: "Material 3",
                            description: "Description of Material 3",
                            from: { seconds: seconds7, nanoseconds: 0 },
                            to: { seconds: seconds8, nanoseconds: 0 },
                            docs: [{ uri: "uri3", title: "Document 3", type: "other" }],
                        },
                    },
                ];
            }
            return [];
        });

        const RealDate = Date;

        // Mock de Date
        jest.spyOn(global, 'Date').mockImplementation((...args: any[]) => {
            if (args.length === 0) {
                return fixedDate; // retourne la date fixée par défaut si aucun argument n'est passé
            }
            // Utilise le constructeur d'origine pour créer une nouvelle instance de Date
            return new RealDate(args[0]);
        });
    });

    // Mock `console.log`
    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialise les mocks pour les prochains tests
    });


    test("renders course with assignments", async () => {

        const screen = render(<CoursePage />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Swent')).toBeTruthy();
        expect(screen.getByText('Thursday, January 2')).toBeTruthy();
        expect(screen.getByText('Friday, January 3')).toBeTruthy();
        expect(screen.getByText('Assignment 1')).toBeTruthy();
        expect(screen.getByText('Assignment 2')).toBeTruthy();
        expect(screen.getByText('Upcoming assignments')).toBeTruthy();
        expect(screen.getByText('Previous assignments')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('No assignments due for now')).toBeNull();

        //Test IDs presence check
        expect(screen.getByTestId('scroll-view')).toBeTruthy();
        expect(screen.getByTestId('course-description')).toBeTruthy();
        expect(screen.getByTestId('upcoming-assignments')).toBeTruthy();
        expect(screen.getAllByTestId('assignment-view')).toHaveLength(2);
        expect(screen.getByTestId('navigate-to-archive-button')).toBeTruthy();
        expect(screen.getByTestId('previous-assignments-icon')).toBeTruthy();
        expect(screen.getByTestId('previous-assignments-text')).toBeTruthy();
        expect(screen.getByTestId('materials-title')).toBeTruthy();
        expect(screen.getByTestId('future-materials-display-touchable')).toBeTruthy();
        expect(screen.getByTestId('toggle-future-materials-icon')).toBeTruthy();
        expect(screen.getByTestId('toggle-future-materials-text')).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId('no-assignment-due')).toBeNull();
        expect(screen.queryByTestId('future-material-view')).toBeNull();
        expect(screen.queryByTestId('feedbacks-touchable')).toBeNull();

        //Fire events
        fireEvent.press(screen.getByTestId('slide-touchable'));
        expect(console.log).toHaveBeenCalledWith('Click on Document 1');
        fireEvent.press(screen.getAllByTestId('exercise-touchable')[0]); // Press the first exercises-touchable
        expect(console.log).toHaveBeenCalledWith('Click on Document 2');
    });

    test('should display future Materials when the \"Show future materials\" is clicked', () => {
        // Render the CoursePage component
        const screen = render(
            <CoursePage />
        );

        // Trouve le bouton TouchableOpacity par testID
        const button = screen.getByTestId('future-materials-display-touchable');

        // Simule un clic sur le bouton
        fireEvent.press(button);

        // Vérifie que le texte du bouton a bien changé
        expect(screen.getByTestId('toggle-future-materials-text').props.children).toBe('Hide future materials');

        expect(screen.getByTestId('future-material-view')).toBeTruthy();

        fireEvent.press(screen.getByTestId('other-touchable'));
        expect(console.log).toHaveBeenCalledWith('Click on Document 3');
    });
});

describe("CoursePage without assignments", () => {
    beforeEach(() => {
        setupStudentMockUseAuth();
        (useDoc as jest.Mock).mockReturnValue({ id: 'StudentID', data: { type: 'student', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as StudentUser });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'default-id' });
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

        //Test IDs presence check
        expect(screen.getByTestId('scroll-view')).toBeTruthy();
        expect(screen.getByTestId('course-description')).toBeTruthy();
        expect(screen.getByTestId('upcoming-assignments')).toBeTruthy();
        expect(screen.getByTestId('no-assignment-due')).toBeTruthy();
        expect(screen.getByTestId('navigate-to-archive-button')).toBeTruthy();
        expect(screen.getByTestId('previous-assignments-icon')).toBeTruthy();
        expect(screen.getByTestId('previous-assignments-text')).toBeTruthy();
        expect(screen.getByTestId('materials-title')).toBeTruthy();
        expect(screen.getByTestId('future-materials-display-touchable')).toBeTruthy();
        expect(screen.getByTestId('toggle-future-materials-icon')).toBeTruthy();
        expect(screen.getByTestId('toggle-future-materials-text')).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId('assignment-view')).toBeNull();
    });
});

describe('Navigate to PreviousPage', () => {

    beforeEach(() => {
        setupStudentMockUseAuth();

        (useDoc as jest.Mock).mockReturnValue({ id: 'StudentID', data: { type: 'student', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as StudentUser });

        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'default-id' });
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

        (useDynamicDocs as jest.Mock).mockImplementation((collectionPath) => {

            if (collectionPath.includes('assignments')) {
                return [
                    {
                        id: "1",
                        data: {
                            name: "Assignment 1",
                            type: "quiz",
                            dueDate: { seconds: 0, nanoseconds: 0 },
                            color: "darkNight"
                        }
                    },
                    {
                        id: "2",
                        data: {
                            name: "Assignment 2",
                            type: "quiz",
                            dueDate: { seconds: 86400, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
                            color: "darkNight"
                        }
                    },
                ];
            } else if (collectionPath.includes('materials')) {
                return [
                    {
                        id: "materialID_1",
                        data: {
                            title: "Material 1",
                            description: "Description of Material 1",
                            from: { seconds: 0, nanoseconds: 0 },
                            to: { seconds: 10000, nanoseconds: 0 },
                            docs: [{ uri: "uri1", title: "Document 1", type: "slide" }],
                        },
                    },
                    {
                        id: "materialID_2",
                        data: {
                            title: "Material 2",
                            description: "Description of Material 2",
                            from: { seconds: 120000, nanoseconds: 0 },
                            to: { seconds: 120000 + 1, nanoseconds: 0 },
                            docs: [{ uri: "uri2", title: "Document 2", type: "exercice" }],
                        },
                    },
                    {
                        id: "materialID_3",
                        data: {
                            title: "Material 3",
                            description: "Description of Material 3",
                            from: { seconds: -120000 - 1, nanoseconds: 0 },
                            to: { seconds: -120000, nanoseconds: 0 },
                            docs: [{ uri: "uri3", title: "Document 3", type: "other" }],
                        },
                    },
                ];
            }
            fail('Invalid collection path');
        });
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
                params: JSON.stringify({
                    courseId: 'course-id-123',  // Vérifie que l'ID est bien celui du cours
                    assignments: [
                        {
                            id: "2",
                            data: {
                                name: "Assignment 2",
                                type: "quiz",
                                dueDate: { seconds: 86400, nanoseconds: 0 }, // Adding 86400 seconds (1 day) to the timestamp
                                color: "darkNight"
                            }
                        },
                        {
                            id: "1",
                            data: {
                                name: "Assignment 1",
                                type: "quiz",
                                dueDate: { seconds: 0, nanoseconds: 0 },
                                color: "darkNight"
                            }
                        },
                    ],
                })
            },
        });

        // Nettoyage après test
        pushSpy.mockRestore();
    });
});

describe('Case where id is invalid', () => {
    beforeEach(() => {
        setupStudentMockUseAuth();
        (useDoc as jest.Mock).mockReturnValue({ id: 'StudentID', data: { type: 'student', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as StudentUser });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 1 });
        jest.spyOn(console, 'log').mockImplementation(() => { });
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

    test('should redirect to home page when id is invalid', () => {
        // Render the CoursePage component
        render(<CoursePage />);

        // Vérifie que router.push a bien été appelé avec les bons paramètres
        expect(Redirect as jest.Mock).toHaveBeenCalledWith(
            expect.objectContaining({
                href: '/',
            }),
            expect.anything() // L'autre argument est l'objet props (tu peux vérifier des props si nécessaire)
        );
    });
});

describe('Case where course data is not available', () => {
    beforeEach(() => {
        setupStudentMockUseAuth();
        (useDoc as jest.Mock).mockReturnValue({ id: 'StudentID', data: { type: 'student', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as StudentUser });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'default-id' });
        jest.spyOn(console, 'log').mockImplementation(() => { });
        (usePrefetchedDynamicDoc as jest.Mock).mockImplementation(() => undefined);
        (useDynamicDocs as jest.Mock).mockImplementation(() => undefined);
    });

    test('should show loading indicator when course data is not available', () => {
        // Render the CoursePage component
        render(<CoursePage />);

        // Vérifie que le composant TActivityIndicator a bien été rendu
        expect(TActivityIndicator as jest.Mock).toHaveBeenCalledWith({ size: 40 }, {});
    });
});

describe("Renders buttons when user is a teacher", () => {
    beforeEach(() => {
        setupTeacherMockUseAuth();
        (useDoc as jest.Mock).mockReturnValue({ id: 'TeacherID', data: { type: 'professor', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as ProfessorUser });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'default-id' });
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

    test("displays the reserved buttons", async () => {

        const screen = render(<CoursePage />);

        expect(screen.getByTestId('course-parameters-touchable')).toBeTruthy();
        expect(screen.getByTestId('course-parameters-icon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('course-parameters-touchable'));

        expect(screen.getByTestId('add-elements-touchable')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-elements-touchable'));
    });

    test("when teacher wants to add an Assignment", async () => {

        const screen = render(<CoursePage />);

        expect(screen.getByTestId('add-elements-touchable')).toBeTruthy();
        expect(screen.getByTestId('plus_button')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-elements-touchable'));
        expect(screen.getByTestId('actionModal')).toBeTruthy();
        expect(screen.getByTestId('animatedViewActionSelection')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-assignment-bouton'));

        expect(screen.getByTestId('addElementView')).toBeTruthy();
        expect(screen.getByTestId('go-back-button')).toBeTruthy();
        expect(screen.getByTestId('go-back-button-icon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('go-back-button'));
    });

    test("when teacher wants to add a Material", async () => {

        const screen = render(<CoursePage />);

        expect(screen.getByTestId('add-elements-touchable')).toBeTruthy();
        expect(screen.getByTestId('plus_button')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-elements-touchable'));
        expect(screen.getByTestId('actionModal')).toBeTruthy();
        expect(screen.getByTestId('animatedViewActionSelection')).toBeTruthy();
        fireEvent.press(screen.getByTestId('add-material-bouton'));
        expect(screen.getByTestId('addModal')).toBeTruthy();
        expect(screen.getByTestId('addElementView')).toBeTruthy();
        expect(screen.getByTestId('go-back-button')).toBeTruthy();
    });

    test("when teacher wants to modify course parameters click on go back", async () => {

        const screen = render(<CoursePage />);

        expect(screen.getByTestId('course-parameters-touchable')).toBeTruthy();
        expect(screen.getByTestId('course-parameters-icon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('course-parameters-touchable'));
        expect(screen.getByTestId('paramModal')).toBeTruthy();
        expect(screen.getByTestId('go-back-opacity')).toBeTruthy();
        fireEvent.press(screen.getByTestId('go-back-opacity'));
    });

    test("when teacher wants to modify course parameters click on finish", async () => {

        (updateCourseAction as jest.Mock).mockReturnValue(Promise.resolve());

        const screen = render(<CoursePage />);

        expect(screen.getByTestId('course-parameters-touchable')).toBeTruthy();
        expect(screen.getByTestId('course-parameters-icon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('course-parameters-touchable'));
        expect(screen.getByTestId('paramModal')).toBeTruthy();
        expect(screen.getByTestId('finish-touchable-opacity')).toBeTruthy();
        fireEvent.press(screen.getByTestId('finish-touchable-opacity'));
    });
});


describe('Navigate to PreviousPage', () => {

    beforeEach(() => {
        setupTeacherMockUseAuth();
        (useDoc as jest.Mock).mockReturnValue({ id: 'TeacherID', data: { type: 'professor', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as ProfessorUser });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'default-id' });
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

        (useDynamicDocs as jest.Mock).mockImplementation((collectionPath) => {

            if (collectionPath.includes('assignments')) {
                return [
                    {
                        id: "1",
                        data: {
                            name: "Assignment 1",
                            type: "quiz",
                            dueDate: { seconds: 0, nanoseconds: 0 },
                            color: "darkNight"
                        }
                    },
                ];
            } else if (collectionPath.includes('materials')) {
                return [
                    {
                        id: "materialID_1",
                        data: {
                            title: "Material 1",
                            description: "Description of Material 1",
                            from: { seconds: 0, nanoseconds: 0 },
                            to: { seconds: 10000, nanoseconds: 0 },
                            docs: [{ uri: "uri1", title: "Document 1", type: "slide" }],
                        },
                    }
                ];
            }
            fail('Invalid collection path');
        });
    });

    test('should open edit material modal and close it', () => {

        // Render the CoursePage component
        const screen = render(
            <CoursePage />
        );

        expect(screen.getByTestId('editMaterial')).toBeTruthy();
        expect(screen.getByTestId('editMaterialIcon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('editMaterial'));
        expect(screen.getByTestId('editMaterialModal')).toBeTruthy();
        expect(screen.getByTestId('editMaterialView')).toBeTruthy();
        expect(screen.getByTestId('go-back-button')).toBeTruthy();
        expect(screen.getByTestId('go-back-button-icon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('go-back-button'));
    });

    test('should delet material', () => {

        // Render the CoursePage component
        const screen = render(
            <CoursePage />
        );

        expect(screen.getByTestId('editMaterial')).toBeTruthy();
        expect(screen.getByTestId('editMaterialIcon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('editMaterial'));
        expect(screen.getByTestId('editMaterialModal')).toBeTruthy();
        expect(screen.getByTestId('editMaterialView')).toBeTruthy();
        expect(screen.getByTestId('delete-touchable-opacity')).toBeTruthy();
        fireEvent.press(screen.getByTestId('delete-touchable-opacity'));
    });

    test('should save changes material', () => {

        (updateMaterialAction as jest.Mock).mockReturnValue(Promise.resolve({ res: { status: 1 } }));

        // Render the CoursePage component
        const screen = render(
            <CoursePage />
        );

        expect(screen.getByTestId('editMaterial')).toBeTruthy();
        expect(screen.getByTestId('editMaterialIcon')).toBeTruthy();
        fireEvent.press(screen.getByTestId('editMaterial'));
        expect(screen.getByTestId('editMaterialModal')).toBeTruthy();
        expect(screen.getByTestId('editMaterialView')).toBeTruthy();
        expect(screen.getByTestId('submit-touchable-opacity')).toBeTruthy();
        fireEvent.press(screen.getByTestId('submit-touchable-opacity'));
    });
}); 