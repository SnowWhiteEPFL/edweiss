import ForumRoute from '@/app/(app)/courses/[id]/forum';
import { render } from '@testing-library/react-native';

jest.mock('@/config/firebase', () => ({
	callFunction: jest.fn(),
}));

// Firebase Timestamp
jest.mock('@react-native-firebase/firestore', () => {
	return {
		Timestamp: jest.fn(),
	};
});

// Toast message
jest.mock('react-native-toast-message', () => ({
	show: jest.fn(),
}));

// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
	__esModule: true,
	default: jest.fn((key: string) => key),
}));

// Expo router with stack screen to test up buttons and title
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	router: {
		push: jest.fn(),
		back: jest.fn(),
	},
	Stack: {
		Screen: jest.fn(({ options }) => (
			<>{options.title}</>
		)),
	},
}));

// DateTimePicker component
// Note: only the set is simulated, one could also add 
//       the onClose event type to capture closing
jest.mock('@react-native-community/datetimepicker', () => ({
	__esModule: true,
	default: ({ onChange }: any) => {
		return onChange(
			{ type: 'set' },
			new Date(2012, 3, 4, 12, 34, 56)
		);
	},
}));

describe("Forum", () => {
	test("First forum test", () => {
		const { getByTestId } = render(<ForumRoute />);
		expect(getByTestId("posts")).toBeTruthy();
	});
});