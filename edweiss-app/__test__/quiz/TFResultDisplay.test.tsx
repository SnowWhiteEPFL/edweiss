import { TFResultDisplay } from '@/components/quiz/QuizComponents';
import Quizzes from '@/model/quizzes';
import { render } from '@testing-library/react-native';
import { TouchableOpacityProps, ViewProps } from 'react-native';

jest.mock('@/contexts/auth', () => ({
	useAuth: jest.fn(),
}));
jest.mock('@/hooks/firebase/firestore', () => ({
	useDynamicDocs: jest.fn(),
}));
jest.mock('@react-native-firebase/auth', () => ({
	__esModule: true,
	default: jest.fn(() => ({
		currentUser: { uid: 'test-user-id' },
	})),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
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
jest.mock('../../components/core/containers/TTouchableOpacity.tsx', () => {
	const { TouchableOpacity, View } = require('react-native');
	return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
		<TouchableOpacity {...props}>
			<View>{props.children}</View>
		</TouchableOpacity>
	);
});
jest.mock('../../components/core/containers/TView.tsx', () => {
	const { View } = require('react-native');

	return (props: ViewProps) => <View {...props} />;
});
jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});


jest.mock('@/config/i18config', () => ({
	__esModule: true,
	default: jest.fn((key: string) => key),
}));
const mockExercise: Quizzes.TF = {
	type: 'TF',
	question: "Is the earth flat?",
	answer: false
};
const mockStudentAnswer = false;

describe('TFResultDisplay', () => {



	it('renders TF question', () => {

		const screen = render(
			<TFResultDisplay
				exercise={mockExercise}
				selected={mockStudentAnswer}
				result={mockExercise.answer}
			/>
		);


		// Check if the question is displayed
		expect(screen.getByText('Is the earth flat?')).toBeTruthy();

		expect(screen.getByTestId('radio-selectables-view')).toBeTruthy();

	});

});