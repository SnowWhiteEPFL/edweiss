import { LectureQuizProfView } from '@/components/quiz/LectureQuizComponents';
import { Document } from '@/config/firebase';
import { useDocs } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes, { LectureQuizzes, LectureQuizzesAttempts, QuizzesAttempts } from '@/model/quizzes';
import { render } from '@testing-library/react-native';
import { ActivityIndicatorProperties, ScrollViewProps, ViewProps } from 'react-native';
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

jest.mock('../../components/core/containers/TView.tsx', () => {
	const { View } = require('react-native');
	return (props: ViewProps) => <View {...props} />;
});

jest.mock('../../components/quiz/QuizComponents.tsx', () => ({
	MCQDisplay: jest.fn(() => <></>),
	TFDisplay: jest.fn(() => <></>),
}));

jest.mock('expo-router', () => ({
	...jest.requireActual('expo-router'),
	useLocalSearchParams: jest.fn(() => {
		return { params: JSON.stringify({ courseId: "courseId", lectureId: "lectureId", lectureEventId: "lectureEventId", prefetchedQuizEvent: "prefetchedQuizEvent" }) };
	}),
	router: {
		push: jest.fn(),
		back: jest.fn()
	},
}));

jest.mock('@/config/i18config', () => ({
	__esModule: true, // This ensures it's treated as a module with a default export
	default: jest.fn((key: string) => key), // Mock `t` to return the key as the translation
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

const mockAnswerMCQ1: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [2]
};
const mockAnswerTF1: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: true
};
const mockAnswerMCQ2: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [2]
};
const mockAnswerTF2: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: false
};
const mockAnswerMCQ3: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [1]
};
const mockAnswerTF3: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: undefined
};

const mockStudentAnswers1 = [mockAnswerMCQ1, mockAnswerTF1];
const mockStudentAnswers2 = [mockAnswerMCQ2, mockAnswerTF2];
const mockStudentAnswers3 = [mockAnswerMCQ3, mockAnswerTF3];

const mockResultMCQ: QuizzesAttempts.MCQAnswersIndices = {
	type: 'MCQAnswersIndices',
	value: [2]
};
const mockResultTF: QuizzesAttempts.TFAnswer = {
	type: 'TFAnswer',
	value: false
};

const mockResults = [mockResultMCQ, mockResultTF]

const mockQuiz: LectureQuizzes.LectureQuiz = {
	answer: mockResultTF,
	ended: false,
	showResultToStudents: true,
	exercise: mockTF,
}
const mockEvent: LectureDisplay.QuizLectureEvent = {
	quizModel: mockQuiz,
	done: false,
	id: "",
	pageNumber: 0,
	type: "quiz"
}

const mockAttemptsData: QuizzesAttempts.QuizAttempt[] = [
	{ attempts: 2, answers: mockStudentAnswers1 },
	{ attempts: 1, answers: mockStudentAnswers2 },
	{ attempts: 1, answers: mockStudentAnswers3 }
];
const mockAttemptsDoc: Document<LectureQuizzesAttempts.LectureQuizAttempt>[] = [
	{ data: { type: "TFAnswer", value: true }, id: 'A' },
	{ data: { type: "TFAnswer", value: false }, id: 'B' },
	{ data: { type: "TFAnswer", value: undefined }, id: 'C' }
]

const mockEventDoc: Document<LectureDisplay.QuizLectureEvent> = { data: mockEvent, id: "mockId" }

const mockPathToAttempts = 'mockPathToAttempts'
describe('LectureQuizProfView', () => {
	beforeEach(() => {
		//(useLocalSearchParams as jest.Mock).mockReturnValue({ params: { courseId: "courseId", lectureId: "lectureId", lectureEventId: "lectureEventId", prefetchedQuizEvent: "prefetchedQuizEvent" } });
		jest.clearAllMocks();
	});
	it('returns an activity indicator if student attempts are undefined', () => {
		(useDocs as jest.Mock).mockReturnValue(undefined);

		const screen = render(<LectureQuizProfView
			pathToAttempts={mockPathToAttempts}
			quizEvent={mockEventDoc}
		/>)

		expect(screen.getByTestId('undefined-quiz-loading-prof')).toBeTruthy()

	})

	it('returns an activity indicator if quiz event is undefined', () => {
		(useDocs as jest.Mock).mockReturnValue(mockAttemptsDoc);

		const screen = render(<LectureQuizProfView
			pathToAttempts={mockPathToAttempts}
			quizEvent={undefined}
		/>)

		expect(screen.getByTestId('undefined-quiz-loading-prof')).toBeTruthy()

	})

	it('returns the distribution display if quiz event is defined, showResultToStudents == true', () => {
		(useDocs as jest.Mock).mockReturnValue(mockAttemptsDoc);

		const screen = render(<LectureQuizProfView
			pathToAttempts={mockPathToAttempts}
			quizEvent={mockEventDoc}
		/>)

		expect(screen.getByTestId('distribution')).toBeTruthy()

	})

	it('returns the waiting display if quiz event is defined, showResultToStudents == false', () => {
		(useDocs as jest.Mock).mockReturnValue(mockAttemptsDoc);

		const screen = render(<LectureQuizProfView
			pathToAttempts={mockPathToAttempts}
			quizEvent={{ ...mockEventDoc, data: { ...mockEventDoc.data, quizModel: { ...mockEventDoc.data.quizModel, showResultToStudents: false } } }}
		/>)

		expect(screen.getByTestId('waiting-view')).toBeTruthy()

	})
})