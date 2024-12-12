import { SingleDistributionDisplay } from '@/app/(app)/quiz/temporaryQuizProfView';
import Quizzes, { LectureQuizzesAttempts } from '@/model/quizzes';
import { render } from '@testing-library/react-native';
import { ViewProps } from 'react-native';


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
	usePrefetchedDynamicDoc: jest.fn(),
	useDocs: jest.fn()
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

// jest.mock('../../app/(app)/quiz/temporaryQuizProfView.tsx', () => ({
// 	getMCQDistribution: jest.fn(),
// 	getTFDistribution: jest.fn(),
// }));
jest.mock('../../components/core/containers/TView.tsx', () => {
	const { View } = require('react-native');
	return (props: ViewProps) => <View {...props} />;
});

describe('SingleDistributionDisplay', () => {
	const mockMCQExercise: Quizzes.MCQ = {
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

	const mockTFExercise: Quizzes.TF = {
		type: 'TF',
		question: 'The earth is flat.',
		answer: false,
	};

	const mockMCQAttempts: LectureQuizzesAttempts.LectureQuizAttempt[] = [
		{ type: 'MCQAnswersIndices', value: [2] },
		{ type: 'MCQAnswersIndices', value: [1] },
		{ type: 'MCQAnswersIndices', value: [0] },
		{ type: 'MCQAnswersIndices', value: [0] },
	];

	const mockTFAttempts: LectureQuizzesAttempts.LectureQuizAttempt[] = [
		{ type: 'TFAnswer', value: true },
		{ type: 'TFAnswer', value: false },
		{ type: 'TFAnswer', value: true },
		{ type: 'TFAnswer', value: false }
	];

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders MCQ distribution correctly', () => {
		const screen = render(
			<SingleDistributionDisplay

				exercise={mockMCQExercise}
				exerciseAttempts={mockMCQAttempts}
			/>
		);

		expect(screen.getByText('What is the capital of France?')).toBeTruthy();
		expect(screen.getByText('Proposition 1 : 50 %')).toBeTruthy();
		expect(screen.getByText('Proposition 2 : 25 %')).toBeTruthy();
		expect(screen.getByText('Proposition 3 : 25 %')).toBeTruthy();
		expect(screen.getByText('Proposition 4 : 0 %')).toBeTruthy();
	});

	it('renders TF distribution correctly', () => {
		const { getByText } = render(
			<SingleDistributionDisplay

				exercise={mockTFExercise}
				exerciseAttempts={mockTFAttempts}
			/>
		);

		expect(getByText('The earth is flat.')).toBeTruthy();
		expect(getByText('False : 50 %')).toBeTruthy();
		expect(getByText('True : 50 %')).toBeTruthy();
		expect(getByText('Undecided : 0 %')).toBeTruthy();
	});

});