import AiGenerateScreen from '@/app/(app)/courses/[id]/deck/aiGenerateDeck';
import { callFunction } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { ProfessorUser } from '@/model/users';
import { Timestamp } from '@react-native-firebase/firestore';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { PdfProps } from 'react-native-pdf';
import { RepositoryMock } from '../__mocks__/repository';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn((keys) => Promise.resolve(keys.map((key: string) => [key, 'value']))),
    multiSet: jest.fn(() => Promise.resolve()),
    multiRemove: jest.fn(() => Promise.resolve()),
}));
// CommonMock.mockAsyncStorage();

const deck1: Memento.Deck = {
    ownerID: ["tuan"],
    name: 'Deck 1',
    cards: []
}

RepositoryMock.mockRepository<Memento.Deck>([{
    ownerID: ["tuan"], name: 'Deck 1', cards: []
}]);

const mockAddDocument = jest.fn();

const mockDeleteDocuments = jest.fn();

jest.mock('@/hooks/repository', () => ({
    ...jest.requireActual('@/hooks/repository'),
    useRepository: jest.fn(() => [[{ id: '1', data: { ownerID: ['tuan'], name: 'Deck 1', cards: [] } }], { deleteDocuments: mockDeleteDocuments, addDocument: mockAddDocument }]),
}));

jest.mock('@/hooks/routeParameters', () => ({
    useStringParameters: jest.fn(() => ({ id: 'course_id' }))
}));

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    Collections: { deck: `users/tuan/courses/course_id/decks` },
    CollectionOf: jest.fn((path: string) => {
        return path;
    }),
}));

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
    router: { push: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</> // Simulate rendering the title for the test
        )),
    },
}));

const TeacherAuthMock = {
    id: "tuan", data: { type: 'professor', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['courseID'] } as ProfessorUser,
};

// mock authentication
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ uid: 'tuan' })),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

// Mock expo-router Stack and Screen
jest.mock('expo-router', () => ({
    router: { back: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</> // Simulate rendering the title for the test
        )),
    },
}));


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

describe('AI generate screen', () => {
    beforeEach(() => {

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
                            docs: [{ uri: "uri2.pdf", title: "Document 2", type: "exercise" }],
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

        Date.now = jest.fn(() => RealDate.now());

    });

    afterEach(() => {
        jest.restoreAllMocks(); // Réinitialise les mocks pour les prochains tests
    });

    it('should render the AI generate screen', () => {
        const { getByText } = render(<AiGenerateScreen />);

        expect(getByText('Material 1')).toBeTruthy();
    });

    it('should be clickable', () => {
        const { getByText } = render(<AiGenerateScreen />);

        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1, data: { deck: deck1, id: '1' } });

        const material1 = getByText('Document 2')
        fireEvent.press(material1);
    });
});