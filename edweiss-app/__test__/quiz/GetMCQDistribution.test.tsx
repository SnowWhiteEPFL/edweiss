import { getMCQDistribution } from '@/app/(app)/quiz/temporaryQuizProfView';
import { QuizzesAttempts } from '@/model/quizzes';

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

jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});

// Mock Firebase Storage
jest.mock('@react-native-firebase/storage', () => ({
	ref: jest.fn(() => ({
		putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
		getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/file.png')),
	})),
}));

describe('getMCQDistribution', () => {
	it('calculates distribution for MCQ with valid responses', () => {
		const studentAttempts: QuizzesAttempts.MCQAnswersIndices[] = [
			{ type: 'MCQAnswersIndices', value: [0] },
			{ type: 'MCQAnswersIndices', value: [2] },
			{ type: 'MCQAnswersIndices', value: [2] },
			{ type: 'MCQAnswersIndices', value: [1] },
		];
		const numberOfPropositions = 3;

		const result = getMCQDistribution(studentAttempts, numberOfPropositions);

		expect(result).toEqual([25, 25, 50]); // Expected percentages based on provided attempts
	});

	it('calculates distribution with some invalid proposition indices', () => {
		const consoleSpy = jest.spyOn(console, 'log');
		const studentAttempts: QuizzesAttempts.MCQAnswersIndices[] = [
			{ type: 'MCQAnswersIndices', value: [0] },
			{ type: 'MCQAnswersIndices', value: [3] }, // invalid index
			{ type: 'MCQAnswersIndices', value: [2] },
			{ type: 'MCQAnswersIndices', value: [1] },
		];
		const numberOfPropositions = 3;

		const result = getMCQDistribution(studentAttempts, numberOfPropositions);

		expect(result).toEqual([100 / 3, 100 / 3, 100 / 3]); // Ignore invalid index (result based on valid attempts)
		expect(consoleSpy).toHaveBeenCalledWith('Warning: in MCQ, Invalid proposition index 3 found in attempt');
		consoleSpy.mockRestore();
	});

	it('returns all zeros if there are no attempts', () => {
		const studentAttempts: QuizzesAttempts.MCQAnswersIndices[] = [];
		const numberOfPropositions = 3;

		const result = getMCQDistribution(studentAttempts, numberOfPropositions);

		expect(result).toEqual([0, 0, 0]);
	});
});