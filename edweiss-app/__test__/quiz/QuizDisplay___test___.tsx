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
}));

jest.mock('@react-native-firebase/auth', () => ({
	// Mock Firebase auth methods you use in your component
	signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' } })),
	signOut: jest.fn(() => Promise.resolve()),
	currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
}));

// jest.mock('@react-native-firebase/firestore', () => {
// 	const mockCollection = jest.fn(() => ({
// 		doc: jest.fn(() => ({
// 			set: jest.fn(() => Promise.resolve()),
// 			get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
// 		})),
// 	}));

// 	return {
// 		// Instead of mocking firestore as a function, we mock it as an object with collection method directly
// 		firestore: {
// 			collection: mockCollection,
// 		},
// 		collection: mockCollection, // Also expose the collection directly for other uses if needed
// 	};
// });
jest.mock('@react-native-firebase/firestore', () => {
	const mockCollection = jest.fn(() => ({
		doc: jest.fn(() => ({
			set: jest.fn(() => Promise.resolve()),
			get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
		})),
	}));

	// Ensure firestore is mocked as both a function and an object with methods
	return {
		__esModule: true,
		default: jest.fn(() => ({
			collection: mockCollection,
		})),
		collection: mockCollection
	};
});

// jest.mock('firebase-admin', () => {
// 	const mockCollection = jest.fn(() => ({
// 		doc: jest.fn(() => ({
// 			set: jest.fn(() => Promise.resolve()),
// 			get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
// 		})),
// 	}));

// 	const mockFirestore = {
// 		collection: mockCollection,
// 	};

// 	return {
// 		firestore: jest.fn(() => mockFirestore), // Mock firestore method to return the mockFirestore object
// 		initializeApp: jest.fn(), // If you're calling initializeApp, you can mock this as well (no-op)
// 	};
// });

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

// jest.mock('@react-navigation/native-stack', () => {
// 	return {
// 		createNativeStackNavigator: jest.fn(() => ({
// 			Screen: () => null,
// 			Navigator: ({ children }) => <>{children}</>,
// 		})),
// 	};
// });



jest.mock('../../components/input/FancyButton.tsx', () => {
	//const { TouchableOpacity, View } = require('react-native');
	return jest.fn(({ onPress, children, loading, icon, ...props }) => {
		return (
			<button onClick={onPress} {...props}>
				{loading ? 'Loading...' : children}
				{icon && <span>{icon}</span>}
			</button>
		);
	});
});

jest.mock('../../components/quiz/QuizComponents.tsx', () => ({
	MCQDisplay: jest.fn(() => <></>),
	TFDisplay: jest.fn(() => <></>),
}));
jest.mock('expo-router', () => {
	return {
		// Mocking the `useRouter` hook that returns a router object
		useRouter: () => ({
			back: jest.fn(), // Mock the back method
			push: jest.fn(), // Mock the push method
			// Add other methods you might need to mock here
		}),
	};
});

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

const mockResults = [
	{ type: 'MCQAnswersIndices', value: [2] }, // Correct
	{ type: 'TFAnswer', value: false }, // Correct
];

// describe('QuizDisplay', () => {

// 	const mockSetUser = jest.fn();

// 	beforeAll(() => {
// 		(useAuth as jest.Mock).mockReturnValue({
// 			setUser: mockSetUser,
// 			user: { id: 'test-id', email: 'test@example.com' },
// 		});
// 	});

// 	beforeEach(() => {
// 		jest.clearAllMocks(); // Clear previous mock calls before each test
// 	});
// 	it('renders questions and handles answer selection', () => {
// 		const onUpdate = jest.fn();
// 		const send = jest.fn();

// 		const { getByText } = render(
// 			<NavigationContainer>
// 				<QuizDisplay
// 					studentAnswers={mockStudentAnswers}
// 					exercises={mockExercises}
// 					onUpdate={onUpdate}
// 					send={send}
// 				/>
// 			</NavigationContainer>

// 		);

// 		// Check if the question is displayed
// 		expect(getByText('What is the capital of France?')).toBeTruthy();
// 		expect(getByText('The earth is flat.')).toBeTruthy();

// 		// Simulate selecting an answer for the MCQ
// 		fireEvent.press(getByText('Madrid')); // Selects Madrid
// 		expect(onUpdate).toHaveBeenCalledWith([1], 0); // 1 is the index of Madrid

// 		// Simulate selecting an answer for TF
// 		fireEvent.press(getByText('True')); // Selects True
// 		expect(onUpdate).toHaveBeenCalledWith(true, 1); // true is selected
// 	});

// 	it('calls send function when submit button is pressed', () => {
// 		const onUpdate = jest.fn();
// 		const send = jest.fn();

// 		const { getByText } = render(
// 			<QuizDisplay
// 				studentAnswers={mockStudentAnswers}
// 				exercises={mockExercises}
// 				onUpdate={onUpdate}
// 				send={send}
// 			/>
// 		);

// 		fireEvent.press(getByText('Submit and exit'));
// 		expect(send).toHaveBeenCalled();
// 	});
// });