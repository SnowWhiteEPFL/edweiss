import { checkMCQPropositionCorrect } from '@/components/quiz/QuizComponents';
import Quizzes from '@/model/quizzes';
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

const mockExercise: Quizzes.MCQ = {
	type: 'MCQ',
	question: 'What is true about France?',
	propositions: [
		{ id: 0, description: '2nd biggest surface overseas', type: "MCQProposition" },
		{ id: 1, description: 'Is in Asia', type: 'MCQProposition' },
		{ id: 2, description: 'Capital is Paris', type: 'MCQProposition' },
		{ id: 3, description: 'Capital is Rome', type: 'MCQProposition' },
	],
	numberOfAnswers: 2,
	answersIndices: [0, 2]
};

describe('checkMCQPropositionCorrect', () => {
	it('returns correct when current proposition is selected and correct', () => {
		expect(checkMCQPropositionCorrect([0, 2], mockExercise.answersIndices, 0)).toBe('correct');
		expect(checkMCQPropositionCorrect([0, 2], mockExercise.answersIndices, 2)).toBe('correct');
	});
	it('returns unselected when current proposition is unselected and wrong', () => {
		expect(checkMCQPropositionCorrect([0, 2], mockExercise.answersIndices, 1)).toBe('unselected');
		expect(checkMCQPropositionCorrect([0, 2], mockExercise.answersIndices, 3)).toBe('unselected');
	});
	it('returns missing when current proposition is unselected and correct', () => {
		expect(checkMCQPropositionCorrect([1, 3], mockExercise.answersIndices, 0)).toBe('missing');
		expect(checkMCQPropositionCorrect([1, 3], mockExercise.answersIndices, 2)).toBe('missing');
	});
	it('returns wrong when current proposition is selected and wrong', () => {
		expect(checkMCQPropositionCorrect([1, 3], mockExercise.answersIndices, 1)).toBe('wrong');
		expect(checkMCQPropositionCorrect([1, 3], mockExercise.answersIndices, 3)).toBe('wrong');
	});

});