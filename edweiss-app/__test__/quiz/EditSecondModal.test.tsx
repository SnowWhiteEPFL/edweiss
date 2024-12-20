import { EditSecondModal } from '@/app/(app)/quiz/createQuizPage';
import { ProgressPopupHandle } from '@/components/animations/ProgressPopup';
import Quizzes from '@/model/quizzes';
import { Material } from '@/model/school/courses';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { render } from '@testing-library/react-native';
import { ActivityIndicatorProperties, ScrollViewProps, ViewProps } from 'react-native';


jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});
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
const mockMaterial: Material = {
	title: "Introduction to React",
	description: "This material covers the basics of React, including components, state, and props.",
	from: { nanoseconds: 0, seconds: 0 },
	to: { nanoseconds: 1000, seconds: 1000 },
	docs: [
		{
			uri: "https://example.com/slide1",
			title: "React Basics",
			type: "slide",
		},
		{
			uri: "https://example.com/exercise1",
			title: "React Exercise 1",
			type: "exercise",
		},
		{
			uri: "https://example.com/image1",
			title: "React Architecture",
			type: "image",
		},
	],
};
jest.mock('@/hooks/firebase/firestore', () => ({
	useDoc: jest.fn(),
	usePrefetchedDynamicDoc: jest.fn(),
	useDocs: jest.fn(),
	useDynamicDocs: jest.fn((collection) => {
		return [{ data: mockMaterial, id: "mockId" }]
	})
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
jest.mock('@/hooks/firebase/firestore', () => ({
	useDoc: jest.fn(),
	usePrefetchedDynamicDoc: jest.fn(),
	useDocs: jest.fn()
}));
jest.mock('react-native-pdf', () => {
	const { View } = require('react-native');
	return (props: ViewProps) => <View {...props} />;
})

const handle: ProgressPopupHandle = {
	state: "none",
	remove: jest.fn(),
	start: jest.fn(),
	stop: jest.fn()
}

jest.mock('../../components/core/modal/ModalContainer.tsx', () => {
	const React = require('react');
	const { View } = require('react-native');

	return {
		ModalContainerScrollView: jest.fn((props: any) => <View {...props}>{props.children}</View>)
	}

});

const mockTF: Quizzes.TF = {
	type: 'TF',
	question: 'The earth is flat.',
	answer: false
};
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

describe('EditSecondModal', () => {

	it('renders MCQ scroll view modal for mcq', () => {		// Mock the handle function
		const secondModalRef = { current: { open: jest.fn(), close: jest.fn(), present: jest.fn(), dismiss: jest.fn(), snapToIndex: jest.fn(), snapToPosition: jest.fn(), expand: jest.fn(), collapse: jest.fn(), forceClose: jest.fn() } }; // Mock modalRef
		const screen = render(<BottomSheetModalProvider>
			<EditSecondModal index={0} modalRef={secondModalRef} editExercise={jest.fn()} exercise={mockMCQ} />
		</BottomSheetModalProvider>)
		expect(screen.getByTestId('MCQ')).toBeTruthy()
	})
	it('renders TF scroll view modal for tf', () => {		// Mock the handle function
		const secondModalRef = { current: { open: jest.fn(), close: jest.fn(), present: jest.fn(), dismiss: jest.fn(), snapToIndex: jest.fn(), snapToPosition: jest.fn(), expand: jest.fn(), collapse: jest.fn(), forceClose: jest.fn() } }; // Mock modalRef

		const screen = render(<BottomSheetModalProvider>
			<EditSecondModal index={0} modalRef={secondModalRef} editExercise={jest.fn()} exercise={mockTF} />
		</BottomSheetModalProvider>)
		expect(screen.getByTestId('TF')).toBeTruthy()
	})

})