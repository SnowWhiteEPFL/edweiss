import ForumRoute from '@/app/(app)/courses/[id]/forum';
import { Document } from '@/config/firebase';
import { Forum } from '@/model/forum';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';

jest.mock('@/config/firebase', () => ({
	callFunction: jest.fn(),
	CollectionOf: jest.fn(() => ({ orderBy: jest.fn() }))
}));

jest.mock('@/hooks/firebase/firestore', () => ({
	useDynamicDocs: jest.fn(() => ([{
		id: "id1",
		data: {
			byId: "user-id1",
			byName: "name",
			anonymous: false,
			answered: false,
			content: "content",
			createdAt: { seconds: 0, nanoseconds: 0 },
			likes: 5,
			numberOfAnswers: 3,
			tags: [],
			title: "title"
		}
	}, {
		id: "id2",
		data: {
			byId: "user-id2",
			byName: "name",
			anonymous: false,
			answered: false,
			content: "content",
			createdAt: { seconds: 0, nanoseconds: 0 },
			likes: 2,
			numberOfAnswers: 0,
			tags: [],
			title: "title"
		}
	}] satisfies Document<Forum.Post>[]))
}));

jest.mock('@react-native-firebase/firestore', () => {
	return {
		Timestamp: jest.fn(),
	};
});

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
		Screen: jest.fn(({ options }) => {
			return options.headerRight();
		}),
	},
	useLocalSearchParams: jest.fn(() => ({ id: "edweiss-demo" }))
}));

jest.mock('@react-native-firebase/auth', () => ({
	signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'uid', email: 'hello@mail.com' } })),
	signOut: jest.fn(() => Promise.resolve()),
	currentUser: { uid: 'uid', email: 'hello@mail.com' },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	getAllKeys: jest.fn(() => Promise.resolve([])),
	multiGet: jest.fn((keys) => Promise.resolve(keys.map((key: string) => [key, 'value']))),
	multiSet: jest.fn(() => Promise.resolve()),
	multiRemove: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-webview', () => ({
	default: jest.fn()
}));

describe("Forum", () => {
	test("Renders posts scroll view", () => {
		const { getByTestId } = render(<ForumRoute />);
		expect(getByTestId("posts")).toBeTruthy();
	});

	test("Go to post view when pressing on post", () => {
		const { getByTestId } = render(<ForumRoute />);
		fireEvent.press(getByTestId(`post-id1`));
		expect(router.push).toHaveBeenCalled();
	});

	test("Go to post creation screen when pressing on header button", () => {
		const { getByTestId } = render(<ForumRoute />);
		fireEvent.press(getByTestId(`create-post-button`));
		expect(router.push).toHaveBeenCalled();
	});
});