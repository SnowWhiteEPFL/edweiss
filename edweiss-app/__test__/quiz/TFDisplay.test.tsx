import { TFDisplay } from '@/components/quiz/QuizComponents';
import Quizzes from '@/model/quizzes';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TouchableOpacityProps, ViewProps } from 'react-native';

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

	});
});