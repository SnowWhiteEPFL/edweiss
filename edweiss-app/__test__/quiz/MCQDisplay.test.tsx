import { MCQDisplay } from '@/components/quiz/QuizComponents';
import Quizzes from '@/model/quizzes';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { TextProps, TouchableOpacityProps } from 'react-native';
import { ViewProps } from 'react-native-svg/lib/typescript/fabric/utils';

const mockExercise: Quizzes.MCQ = {
	type: 'MCQ',
	question: 'What is the capital of France?',
	propositions: [
		{ id: 0, description: 'Berlin', type: "MCQProposition" },
		{ id: 1, description: 'Madrid', type: 'MCQProposition' },
		{ id: 2, description: 'Paris', type: 'MCQProposition' },
		{ id: 3, description: 'Rome', type: 'MCQProposition' },
	],
	numberOfAnswers: 1,
	answersIndices: [2]
};

const mockStudentAnswer = [1];
const exId = 0;

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
jest.mock('../../components/core/rich-text/RichText.tsx', () => {
	const { Text } = require('react-native');
	return (props: TextProps) => <Text {...props} />;
});
jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});

const onUpdate = jest.fn();

jest.useFakeTimers();

describe('MCQDisplay', () => {
	it('renders MCQ', () => {

		const screen = render(
			<MCQDisplay
				exercise={mockExercise}
				selectedIds={mockStudentAnswer}
				onUpdate={onUpdate}
				exId={exId}
			/>
		);

		// Check if the question is displayed
		expect(screen.getByText('What is the capital of France?')).toBeTruthy();
		for (let index = 0; index < mockExercise.numberOfAnswers; index++) {
			expect(screen.getByText(mockExercise.propositions[index].description)).toBeTruthy();
		}

	});
	it('updates answer', async () => {

		const screen = render(
			<MCQDisplay
				exercise={mockExercise}
				selectedIds={mockStudentAnswer}
				onUpdate={onUpdate}
				exId={exId}
			/>
		);

		fireEvent.press(screen.getByText("Berlin"));

		await waitFor(() => {
			expect(onUpdate).toHaveBeenCalledTimes(1);
			expect(onUpdate).toHaveBeenCalledWith([0], exId); // Berlin is selected // 
		});

	});
});
