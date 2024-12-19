import { handleMCQColor, handleTFColor } from '@/components/quiz/QuizComponents';

jest.mock('react-native-autoheight-webview', () => {
	const { View } = require('react-native');
	return () => <View />; // Mock AutoHeightWebView as a simple empty View
});

describe('handleTFColor', () => {
	test('should return "surface0" when selected is undefined', () => {
		expect(handleTFColor(undefined, true)).toBe("surface0");
		expect(handleTFColor(undefined, false)).toBe("surface0");
	});

	test('should return "surface0" when selected does not match propValue', () => {
		expect(handleTFColor(true, false)).toBe("surface0");
		expect(handleTFColor(false, true)).toBe("surface0");
	});

	test('should return "blue" when selected matches propValue', () => {
		expect(handleTFColor(true, true)).toBe("blue");
		expect(handleTFColor(false, false)).toBe("blue");
	});
});

describe('handleMCQColor', () => {
	test('should return "surface0" when selectedIds is undefined', () => {
		expect(handleMCQColor(undefined as unknown as number[], 0)).toBe("surface0");
		expect(handleMCQColor(undefined as unknown as number[], 2)).toBe("surface0");
	});

	test('should return "blue" when propositionIndex is in selectedIds', () => {
		const selectedIds = [1, 3, 5];
		expect(handleMCQColor(selectedIds, 1)).toBe("blue");
		expect(handleMCQColor(selectedIds, 3)).toBe("blue");
		expect(handleMCQColor(selectedIds, 5)).toBe("blue");
	});

	test('should return "surface0" when propositionIndex is not in selectedIds', () => {
		const selectedIds = [1, 3, 5];
		expect(handleMCQColor(selectedIds, 0)).toBe("surface0");
		expect(handleMCQColor(selectedIds, 2)).toBe("surface0");
		expect(handleMCQColor(selectedIds, 4)).toBe("surface0");
	});
});