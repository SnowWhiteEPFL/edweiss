import { checkResultColor } from '@/components/quiz/QuizComponents';

describe('checkResultColor', () => {
	it('returns "surface0" for "unselected"', () => {
		expect(checkResultColor('unselected')).toBe('surface0');
	});

	it('returns "red" for "wrong"', () => {
		expect(checkResultColor('wrong')).toBe('red');
	});

	it('returns "yellow" for "missing"', () => {
		expect(checkResultColor('missing')).toBe('yellow');
	});

	it('returns "green" for "correct"', () => {
		expect(checkResultColor('correct')).toBe('green');
	});

	// it('throws an error or handles unknown values gracefully', () => {
	// 	// This part depends on how you want to handle unexpected values
	// 	// Option 1: If you want to throw an error for unexpected values
	// 	expect(() => checkResultColor('unknown')).toThrow();

	// 	// Option 2: If you want to return a default value, like 'surface0'
	// 	expect(checkResultColor('unknown' as Quizzes.Results)).toBe('surface0'); // if you have a fallback value
	// });
});