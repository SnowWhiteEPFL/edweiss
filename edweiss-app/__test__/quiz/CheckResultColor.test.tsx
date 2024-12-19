import { checkResultColor } from '@/components/quiz/QuizComponents';

jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});
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

});