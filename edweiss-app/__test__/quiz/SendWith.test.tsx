import { sendWith } from '@/app/(app)/quiz/quizStudentView';
import { callFunction } from '@/config/firebase';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';

jest.mock('@/contexts/auth', () => ({
	useAuth: jest.fn(),
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
	get: jest.fn(),
	set: jest.fn(),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
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
	getAllKeys: jest.fn(() => Promise.resolve(['key1', 'key2'])),
	multiGet: jest.fn((keys) => Promise.resolve(keys.map((key: string) => [key, 'value']))),
	multiSet: jest.fn(() => Promise.resolve()),
	multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-firebase/auth', () => ({
	// Mock Firebase auth methods you use in your component
	signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' } })),
	signOut: jest.fn(() => Promise.resolve()),
	currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
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

	// Mock the doc function
	const mockDoc = jest.fn(() => ({
		set: jest.fn(() => Promise.resolve()),
		get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
		update: jest.fn(() => Promise.resolve()),
		delete: jest.fn(() => Promise.resolve()),
		onSnapshot: mockOnSnapshot, // Attach the onSnapshot method here
	}));

	// Mock the collection function
	const mockCollection = jest.fn(() => ({
		// Collection mock now returns the doc mock when calling doc
		doc: mockDoc,
		add: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
		where: jest.fn(() => ({
			get: jest.fn(() => Promise.resolve({ docs: [] })),
		})),
		orderBy: jest.fn(() => ({
			get: jest.fn(() => Promise.resolve({ docs: [] })),
		})),
	}));

	// Ensure firestore is mocked as both a function and an object with methods
	return {
		__esModule: true,
		default: jest.fn(() => ({
			collection: mockCollection,
			doc: mockDoc, // Attach doc as a top-level function
		})),
		collection: mockCollection,
		doc: mockDoc, // Mock doc separately to align with the Firestore API
		onSnapshot: mockOnSnapshot, // Mock onSnapshot separately in case needed
	};
});
jest.mock('@/hooks/firebase/firestore', () => ({
	useDoc: jest.fn(),
	usePrefetchedDynamicDoc: jest.fn()
}));


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

const mockMCQ: Quizzes.MCQ = {
	type: 'MCQ',
	question: 'What is the capital of France?',
	propositions: [
		{ id: 0, description: 'Berlin', type: 'MCQProposition' },
		{ id: 1, description: 'Madrid', type: 'MCQProposition' },
		{ id: 2, description: 'Paris', type: 'MCQProposition' },
		{ id: 3, description: 'Rome', type: 'MCQProposition' },
	],
	numberOfAnswers: 1,
	answersIndices: [2],
};
const mockTF: Quizzes.TF = {
	type: 'TF',
	question: 'The earth is flat.',
	answer: false
};

const mockExercises: Quizzes.Exercise[] = [mockMCQ, mockTF];

const mockAnswerMCQ: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [2]
};
const mockAnswerTF: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: true
};

const mockStudentAnswers = [mockAnswerMCQ, mockAnswerTF];

const mockResultMCQ: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [2]
};
const mockResultTF: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: false
};

const mockResults = [mockResultMCQ, mockResultTF]

const mockPreviousAttempt: QuizzesAttempts.QuizAttempt = {
	attempts: 1,
	answers: [
		{
			type: 'MCQAnswersIndices',
			value: [1]
		},
		{
			type: 'TFAnswer',
			value: false
		}
	]
}

jest.mock('../../config/firebase.ts', () => ({
	callFunction: jest.fn()
}));
//const mockCallFunction = jest.fn()

describe('sendWith', () => {
	const mockCourseId = 'course123';
	const mockPathToAttempts = '/path/to/attempts';
	const mockQuizId = 'quiz123';

	beforeEach(() => {
		jest.clearAllMocks(); // Clear previous mocks to avoid interference between tests
		jest.spyOn(console, 'log').mockImplementation(() => { }); // Suppress console output during tests
	});
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('submits a quiz attempt with incremented attempts if previousAttempt exists', async () => {
		(callFunction as jest.Mock).mockResolvedValue({ status: 1, data: { id: 'attempt123' } });

		await sendWith(mockPreviousAttempt, mockStudentAnswers, mockCourseId, mockPathToAttempts, mockQuizId);

		expect(callFunction).toHaveBeenCalledWith(QuizzesAttempts.Functions.createQuizAttempt, {
			quizAttempt: { attempts: 2, answers: mockStudentAnswers },
			courseId: mockCourseId,
			quizId: mockQuizId,
			path: mockPathToAttempts
		});
		expect(console.log).toHaveBeenCalledWith(`OKAY, submitted quiz with id attempt123`);
	});

	it('submits a quiz attempt with attempts set to 1 if previousAttempt is undefined', async () => {
		(callFunction as jest.Mock).mockResolvedValue({ status: 1, data: { id: 'attempt456' } });

		await sendWith(undefined, mockStudentAnswers, mockCourseId, mockPathToAttempts, mockQuizId);

		expect(callFunction).toHaveBeenCalledWith(QuizzesAttempts.Functions.createQuizAttempt, {
			quizAttempt: { attempts: 1, answers: mockStudentAnswers },
			courseId: mockCourseId,
			quizId: mockQuizId,
			path: mockPathToAttempts
		});
		expect(console.log).toHaveBeenCalledWith(`OKAY, submitted quiz with id attempt456`);
	});

	it('logs an error message if the submission fails', async () => {
		(callFunction as jest.Mock).mockResolvedValue({ status: 0 });

		await sendWith(mockPreviousAttempt, mockStudentAnswers, mockCourseId, mockPathToAttempts, mockQuizId);

		expect(console.log).toHaveBeenCalledWith('Error while submitting attempt');
	});
});
