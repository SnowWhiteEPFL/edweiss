import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { ProfessorUser, StudentUser } from '@/model/users';
import { allowToEditDeck, checkDupplication_EmptyField, getStatusColor, selectedCardIndices_play, sortingCards, userIdToName } from '@/utils/memento/utilsFunctions';
import { Timestamp } from '@react-native-firebase/firestore';

// Mock cards
const card1: Memento.Card = {
    ownerID: 'tuan',
    question: 'Question 1',
    answer: 'Answer 1',
    learning_status: 'Got it',
};

const card2: Memento.Card = {
    ownerID: 'tuan',
    question: 'Question 2',
    answer: 'Answer 2',
    learning_status: 'Not yet',
};

const card3: Memento.Card = {
    ownerID: 'tuan',
    question: 'Question 3',
    answer: 'Answer 3',
    learning_status: 'Got it',
};

const TeacherAuthMock = {
    id: "tuan", data: { type: 'professor', name: 'Test User', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['course_id'] } as ProfessorUser,
};

const StudentAuthMock = {
    id: "tuan_1", data: { type: 'student', name: 'Test User student', createdAt: { seconds: 0, nanoseconds: 0 } as Timestamp, courses: ['course_id'] } as StudentUser,
};

// Mock Firebase functions and firestore
jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn((path: string) => {
        return path;
    }),
}));

jest.mock('@react-native-firebase/firestore', () => {
    // Mock the onSnapshot method
    const mockOnSnapshot = jest.fn((callback) => {
        // Ensure callback is a function before calling it
        if (typeof callback === 'function') {
            // Simulate calling the callback with mock document data
            callback({
                exists: true,
                data: () => ({ field: 'value' }),
            });
        }
        // Return a mock unsubscribe function
        return jest.fn();
    });

    // Ensure firestore is mocked as both a function and an object with methods
    return {
        __esModule: true,
        onSnapshot: mockOnSnapshot, // Mock onSnapshot separately in case needed
    };
});

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(),
}));

describe('selected card indices to play', () => {
    it('should return the correct indices of selected cards', () => {
        const cards = [card1, card2, card3];
        const selectedCards = [card1, card3];
        const selectedCardIndices_to_play = selectedCardIndices_play(selectedCards, cards)
        expect(selectedCardIndices_to_play).toEqual([0, 2]);
    });
});

describe('sorting cards', () => {
    it('should return the correct sorted list of cards', () => {
        const cards = [card1, card2, card3];
        const sortedCards = sortingCards(cards);
        expect(sortedCards).toEqual([card2, card1, card3]);
    });
});

describe('get status color', () => {
    it('should return the correct color of the status', () => {
        expect(getStatusColor('Not yet')).toBe('red');
        expect(getStatusColor('Got it')).toBe('green');
    });
});

describe('check duplication, empty field', () => {
    it('should return 0 if the question is duplicated or the field is empty, 1 otherwise', () => {
        const setExistedQuestion = jest.fn();
        const setEmptyField = jest.fn();
        expect(checkDupplication_EmptyField(true, true, setExistedQuestion, setEmptyField)).toBe(0);
        expect(setExistedQuestion).toHaveBeenCalledWith(true);
        expect(setEmptyField).toHaveBeenCalledWith(true);
    });

    it('should return 0 if field is empty, 1 otherwise', () => {
        const setExistedQuestion = jest.fn();
        const setEmptyField = jest.fn();
        expect(checkDupplication_EmptyField(false, true, setExistedQuestion, setEmptyField)).toBe(0);
        expect(setEmptyField).toHaveBeenCalledWith(true);
    });

    it('should return 1', () => {
        const setExistedQuestion = jest.fn();
        const setEmptyField = jest.fn();
        expect(checkDupplication_EmptyField(false, false, setExistedQuestion, setEmptyField)).toBe(1);
    });
});

describe('check userId to name', () => {
    it('should return the correct name of the user', () => {
        const mockUsers = [TeacherAuthMock, StudentAuthMock];

        // Mock implementation of useDynamicDocs
        (useDynamicDocs as jest.Mock).mockReturnValue(mockUsers);

        expect(userIdToName('tuan')).toBe('Test User');
    });
});

describe('allow to edit check', () => {
    it('should return true if the current user is a professor, regardless of ownership', () => {
        const ids_professor_map = new Map();
        const ownerIds = ['user1', 'user2'];
        expect(allowToEditDeck('professor', ownerIds, ids_professor_map)).toBe(true);
    });

    it('should return true if no owners are professors', () => {
        const ids_professor_map = new Map([['user1', 'professor']]);
        const ownerIds = ['user2', 'user3'];
        expect(allowToEditDeck('student', ownerIds, ids_professor_map)).toBe(true);
    });
});