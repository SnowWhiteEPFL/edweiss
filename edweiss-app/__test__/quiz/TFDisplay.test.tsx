import { TFDisplay } from '@/components/quiz/QuizComponents';
import Quizzes from '@/model/quizzes';
import { render } from '@testing-library/react-native';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';

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
jest.mock('../../components/core/rich-text/RichText.tsx', () => {
	const { Text } = require('react-native');
	return (props: TextProps) => <Text {...props} />;
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
		expect(screen.getByTestId('radio-selectables-view')).toBeTruthy()

	});

	// it('updates answer', async () => {

	// 	const screen = render(
	// 		<TFDisplay
	// 			exercise={mockExercise}
	// 			selected={mockStudentAnswer}
	// 			onUpdate={onUpdate}
	// 			exId={exId}
	// 		/>
	// 	);

	// 	await act(() => {
	// 		fireEvent.press(screen.getByText("quiz:quiz_display.true"));
	// 	})

	// 	jest.runAllTimers();
	// 	await waitFor(() => {
	// 		expect(onUpdate).toHaveBeenCalledTimes(1);
	// 		expect(onUpdate).toHaveBeenCalledWith(true, exId);
	// 	});

	// });
});