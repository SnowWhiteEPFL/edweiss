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

const mockExercise: Quizzes.TF = {
	type: 'TF',
	question: "Is the earth flat?",
	answer: false
};
const mockStudentAnswer = false;
// const screen = render(
// 	<TFResultDisplay
// 		exercise={mockExercise}
// 		selected={mockStudentAnswer}
// 		result={mockExercise.answer}
// 	/>
// );

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

		const trueButton = screen.getByTestId('true');
		const falseButton = screen.getByTestId('false');

		expect(screen.getByText('True')).toBeTruthy();
		expect(trueButton).toBeTruthy();
		expect(screen.getByText('False')).toBeTruthy();
		expect(falseButton).toBeTruthy();

	});

	it('shows corresponding answer', () => {

		const screen = render(
			<TFResultDisplay
				exercise={mockExercise}
				selected={mockStudentAnswer}
				result={mockExercise.answer}
			/>
		);

		const trueButton = screen.getByTestId('true');
		const falseButton = screen.getByTestId('false');
		expect(trueButton).toBeTruthy();
		expect(falseButton).toBeTruthy();

		// console.log("props of true button : " + trueButton.props.style.backgroundColor);

		// expect(trueButton.props.backgroundColor).toBe('surface0');
		// expect(falseButton.props.backgroundColor).toBe('green');


	});
});