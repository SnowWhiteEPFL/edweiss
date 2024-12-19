import { checkTFCorrect } from '@/components/quiz/QuizComponents';
import { TouchableOpacityProps, ViewProps } from 'react-native';


jest.mock('../../components/core/containers/TTouchableOpacity.tsx', () => {
	const { TouchableOpacity, View } = require('react-native');
	return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
		<TouchableOpacity {...props}>
			<View>{props.children}</View>
		</TouchableOpacity>
	);
});
jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});
jest.mock('../../components/core/containers/TView.tsx', () => {
	const { View } = require('react-native');
	return (props: ViewProps) => <View {...props} />;
});


describe('checkTFCorrect', () => {
	it('returns correct when selected is Value, current button is Value and answer is Value', () => {
		expect(checkTFCorrect(true, true, true)).toBe('correct');
		expect(checkTFCorrect(false, false, false)).toBe('correct');
	});
	it('returns unselected when selected is Undefined or !value, current button is value and answer is !value', () => {
		expect(checkTFCorrect(undefined, false, true)).toBe('unselected');
		expect(checkTFCorrect(undefined, true, false)).toBe('unselected');
		expect(checkTFCorrect(true, false, true)).toBe('unselected');
		expect(checkTFCorrect(false, true, false)).toBe('unselected');
	});
	it('returns missing when selected is undefined, current button is value and answer is value', () => {
		expect(checkTFCorrect(undefined, true, true)).toBe('missing');
		expect(checkTFCorrect(undefined, false, false)).toBe('missing');
	});
	it('returns wrong when selected is value, current button is value and answer is !value', () => {
		expect(checkTFCorrect(true, true, false)).toBe('wrong');
		expect(checkTFCorrect(false, false, true)).toBe('wrong');
	});
});