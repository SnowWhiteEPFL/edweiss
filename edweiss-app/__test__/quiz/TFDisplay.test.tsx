import { TFDisplay } from '@/components/quiz/QuizComponents';
import Quizzes from '@/model/quizzes';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TouchableOpacityProps, ViewProps } from 'react-native';

// jest.mock('@/contexts/auth', () => ({
// 	useAuth: jest.fn(),
// }));
// jest.mock('@/hooks/firebase/firestore', () => ({
// 	useDynamicDocs: jest.fn(),
// }));
// jest.mock('@react-native-firebase/auth', () => ({
// 	__esModule: true,
// 	default: jest.fn(() => ({
// 		currentUser: { uid: 'test-user-id' },
// 	})),
// }));
// jest.mock('@react-native-async-storage/async-storage', () => ({
// 	setItem: jest.fn(),
// 	getItem: jest.fn(),
// 	removeItem: jest.fn(),
// }));

// jest.mock('@react-native-google-signin/google-signin', () => ({
// 	GoogleSignin: {
// 		configure: jest.fn(),
// 		hasPlayServices: jest.fn(() => Promise.resolve(true)),
// 		signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
// 		signOut: jest.fn(() => Promise.resolve()),
// 		isSignedIn: jest.fn(() => Promise.resolve(true)),
// 		getTokens: jest.fn(() => Promise.resolve({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
// 	},
// }));
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
const exId = 0;
const mockStudentAnswer = false;
const onUpdate = jest.fn();

jest.useFakeTimers();


describe('TFDisplay', () => {
	it('renders TF question', () => {

		const screen = render(
			<TFDisplay
				exercise={mockExercise}
				selected={mockStudentAnswer}
				onUpdate={onUpdate}
				exId={exId}
			/>
		);

		// Check if the question is displayed
		expect(screen.getByText('Is the earth flat?')).toBeTruthy();
		expect(screen.getByText('True')).toBeTruthy();
		expect(screen.getByTestId('true')).toBeTruthy();
		expect(screen.getByText('False')).toBeTruthy();
		expect(screen.getByTestId('false')).toBeTruthy();

		// Simulate selecting "True"
		// fireEvent.press(screen.getByTestId("true"));
		// expect(onUpdate).toHaveBeenCalledWith(true, exId);
		// fireEvent.press(screen.getByText('False'));
		// expect(onUpdate).toHaveBeenCalledWith(false, exId);
		// fireEvent.press(screen.getByText('False'));
		// expect(onUpdate).toHaveBeenCalledWith(undefined, exId);

	});

	it('updates answer', async () => {

		const screen = render(
			<TFDisplay
				exercise={mockExercise}
				selected={mockStudentAnswer}
				onUpdate={onUpdate}
				exId={exId}
			/>
		);

		fireEvent.press(screen.getByTestId("true"));

		jest.runAllTimers();
		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalledTimes(1);
			expect(onUpdate).toHaveBeenCalledWith(true, exId);
		});

		// Simulate selecting "True"
		// fireEvent.press(screen.getByTestId("true"));
		// expect(onUpdate).toHaveBeenCalledWith(true, exId);
		// fireEvent.press(screen.getByText('False'));
		// expect(onUpdate).toHaveBeenCalledWith(false, exId);
		// fireEvent.press(screen.getByText('False'));
		// expect(onUpdate).toHaveBeenCalledWith(undefined, exId);

	});
});