import { QuizDisplay, QuizResultDisplay, default as QuizStudentView } from '@/app/(app)/quiz/quizStudentView';
import { useAuth } from '@/contexts/auth';
import { useDoc, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
//import { useDoc } from '@/hooks/firebase/firestore';
//import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicatorProperties, ScrollViewProps } from 'react-native';

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

jest.mock('../../components/input/FancyButton.tsx', () => {
	return jest.fn(({ onPress, children, loading, icon, ...props }) => {
		return (
			<button onClick={onPress} {...props}>
				{loading ? 'Loading...' : children}
				{icon && <span>{icon}</span>}
			</button>
		);
	});
});
jest.mock('../../components/core/TActivityIndicator.tsx', () => {
	const { ActivityIndicator } = require('react-native');
	return (props: ActivityIndicatorProperties) => (
		<ActivityIndicator {...props} />
	)
});
jest.mock('../../components/core/containers/TScrollView.tsx', () => {
	const { ScrollView } = require('react-native');
	return (props: ScrollViewProps) => (
		<ScrollView {...props} />
	)
});

jest.mock('../../components/quiz/QuizComponents.tsx', () => ({
	MCQDisplay: jest.fn(() => <></>),
	TFDisplay: jest.fn(() => <></>),
}));

jest.mock('expo-router', () => ({
	...jest.requireActual('expo-router'),
	useLocalSearchParams: jest.fn(),
	router: {
		push: jest.fn(),
		back: jest.fn()
	},
}));

jest.mock('../../components/core/header/RouteHeader', () => {
	const { Text, View } = require('react-native');
	return ({ title, right }: { title: string; right?: React.ReactNode }) => (
		<View>
			<Text>{title}</Text>
			{right && <View>{right}</View>}
		</View>
	);
});

const mockOnUpdate = jest.fn()
jest.mock('../../components/quiz/QuizComponents.tsx', () => {
	const { TouchableOpacity, Text, View } = require('react-native');
	return {
		MCQDisplay: ({ onUpdate }: { onUpdate: (selectedIds: number[] | boolean | undefined, exId: number) => void }) => (
			<TouchableOpacity onPress={() => onUpdate([2], 0)} testID="mcq-display" >
				<Text>MCQ Display</Text>
			</TouchableOpacity >
		),
		TFDisplay: ({ onUpdate }: { onUpdate: (selectedIds: number[] | boolean | undefined, exId: number) => void }) => (
			<TouchableOpacity onPress={() => onUpdate(true, 1)} testID="tf-display">
				<Text>TF Display</Text>
			</TouchableOpacity>
		),
		MCQResultDisplay: () => (
			<View testID="mcq-result-display">
				<Text>MCQ Result Display</Text>
			</View>
		),
		TFResultDisplay: () => (
			<View testID="tf-result-display">
				<Text>TF Result Display</Text>
			</View>
		),
	}
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

const mockResultMCQ: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [2]
};
const mockResultTF: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: false
};

const mockResults = [mockResultMCQ, mockResultTF]

describe('QuizStudentView', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});
	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('renders loading indicator when quiz is loading', async () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ quizId: 'test-quiz-id', path: 'test-path', courseId: 'test-course' });
		(useAuth as jest.Mock).mockReturnValue({ uid: 'test-uid' });
		(usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([undefined, true]); // Mock loading state

		const { getByTestId } = render(<QuizStudentView />);
		await waitFor(async () => {
			// Perform assertions after state update
			expect(getByTestId('undefined-quiz-loading')).toBeTruthy();
		});
	});


	it('renders QuizDisplay if showResultToStudents is false', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ quizId: 'test-quiz-id', path: 'test-path', courseId: 'test-course' });
		(useAuth as jest.Mock).mockReturnValue({ uid: 'test-uid' });

		// Mock quiz data without showing results
		(usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([
			{
				data: { showResultToStudents: false, exercises: [{ type: 'MCQ', question: 'What is 2+2?' }] },
				id: 'test-quiz-id',
			},
			false,
		]);
		(useDoc as jest.Mock).mockReturnValue(null);

		const { getByTestId } = render(<QuizStudentView />);
		expect(getByTestId('quiz-display')).toBeTruthy();
	});

	it('renders QuizResultDisplay if showResultToStudents is true', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({ quizId: 'test-quiz-id', path: 'test-path', courseId: 'test-course' });
		(useAuth as jest.Mock).mockReturnValue({ uid: 'test-uid' });

		// Mock quiz data with showing results
		(usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([
			{
				data: { showResultToStudents: true, answers: [{ value: [1] }], exercises: [{ type: 'MCQ', question: 'What is 2+2?' }] },
				id: 'test-quiz-id',
			},
			false,
		]);
		(useDoc as jest.Mock).mockReturnValue({ data: { answers: [{ value: [1] }] } });

		const { getByTestId } = render(<QuizStudentView />);
		expect(getByTestId('quiz-result-display')).toBeTruthy();
	});

	it('calls onUpdate when MCQ or TF component updates', () => {
		const mockOnUpdate = jest.fn();
		const screen = render(
			<QuizDisplay
				studentAnswers={mockStudentAnswers}
				exercises={mockExercises}
				onUpdate={mockOnUpdate}
				send={jest.fn()}
				testId='mock-quiz-display'
			/>
		);

		fireEvent.press(screen.getByTestId('mcq-display'));
		expect(mockOnUpdate).toHaveBeenCalledWith([2], 0); // Updated value

		fireEvent.press(screen.getByTestId('tf-display'));
		expect(mockOnUpdate).toHaveBeenCalledWith(true, 1); // Updated value
	});

	it('calls send and navigates back on Submit press', async () => {
		const mockSend = jest.fn();

		const screen = render(
			<QuizDisplay
				studentAnswers={mockStudentAnswers}
				exercises={mockExercises}
				onUpdate={mockOnUpdate}
				send={mockSend}
				testId='mock-quiz-display'
			/>
		);

		const submitButton = screen.getByTestId('submit');
		fireEvent.press(submitButton);
		await waitFor(() => {
			expect(mockSend).toHaveBeenCalledTimes(1);
			expect(router.back).toHaveBeenCalled();
		});
	});
	it('navigates back on Exit result press', async () => {

		const screen = render(
			<QuizResultDisplay
				studentAnswers={mockStudentAnswers}
				exercises={mockExercises}
				results={mockResults}
				testId='mock-quiz-display'
				quizName='mockQuizName'
			/>
		);

		const submitButton = screen.getByTestId('exit-result');
		fireEvent.press(submitButton);
		await waitFor(() => {
			expect(router.back).toHaveBeenCalled();
		});
	});

	it('calculates score in QuizResultDisplay correctly', () => {
		const screen = render(
			<QuizResultDisplay
				studentAnswers={mockStudentAnswers}
				exercises={mockExercises}
				results={mockResults}
				testId='mock-quiz-result-display'
				quizName='mockQuizName'
			/>
		);

		expect(screen.getByText(/Your score : 1\/2/)).toBeTruthy();
	});

});