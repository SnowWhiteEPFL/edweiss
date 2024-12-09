import ForumCreatePostRoute from '@/app/(app)/courses/[id]/forum/create-post';
import { callFunction } from '@/config/firebase';
import { AppUser } from '@/model/users';
import { act, fireEvent, render } from '@testing-library/react-native';

jest.mock('@/config/firebase', () => ({
	callFunction: jest.fn((_args: any) => {
		return { status: 1, data: { id: "new-id" } };
	}),
	CollectionOf: jest.fn(() => ({ orderBy: jest.fn() }))
}));

jest.mock('@/contexts/auth', () => ({
	useAuth: jest.fn(() => ({
		uid: "user-id"
	}))
}));

jest.mock('@/contexts/user', () => ({
	useUser: jest.fn(() => ({
		user: {
			name: "John Doe",
			courses: [],
			createdAt: { seconds: 0, nanoseconds: 0 },
			type: "student",
		} satisfies AppUser
	}))
}));

// jest.mock('@/hooks/firebase/firestore', () => ({
// 	useDynamicDocs: jest.fn(() => ([{
// 		id: "id1",
// 		data: {
// 			byId: "user-id1",
// 			byName: "name",
// 			anonymous: false,
// 			answered: false,
// 			content: "content",
// 			createdAt: { seconds: 0, nanoseconds: 0 },
// 			likes: 5,
// 			numberOfAnswers: 3,
// 			tags: [],
// 			title: "title"
// 		}
// 	}, {
// 		id: "id2",
// 		data: {
// 			byId: "user-id2",
// 			byName: "name",
// 			anonymous: false,
// 			answered: false,
// 			content: "content",
// 			createdAt: { seconds: 0, nanoseconds: 0 },
// 			likes: 2,
// 			numberOfAnswers: 0,
// 			tags: [],
// 			title: "title"
// 		}
// 	}] satisfies Document<Forum.Post>[]))
// }));

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
	default: jest.fn(() => <></>)
}));

// jest.mock('@/components/core/rich-text/RichText', () => ({
// 	default: jest.fn((children: any) => <Text>{children}</Text>)
// }));

jest.mock('@/components/core/rich-text/RichText', () => {
	const { Text } = require('react-native');
	return (props: any) => <Text {...props} />;
});

jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
	const { TouchableOpacity, View } = require('react-native');
	return (props: any) => (
		<TouchableOpacity {...props}>
			<View>{props.children}</View>
		</TouchableOpacity>
	);
});

jest.mock('@/components/core/containers/TView.tsx', () => {
	const { View } = require('react-native');
	return (props: any) => <View {...props} />;
});

jest.mock('@/components/core/TText.tsx', () => {
	const { Text } = require('react-native');
	return (props: any) => <Text {...props} />;
});

describe("Create Post", () => {
	test("Not call submit cloud function when all parameters are empty", () => {
		const { getByTestId } = render(<ForumCreatePostRoute />);
		fireEvent.press(getByTestId("submit-button"));
		expect(callFunction).not.toHaveBeenCalled();
	});

	test("Not call submit cloud function when title is empty", async () => {
		const { getByTestId, getByPlaceholderText } = render(<ForumCreatePostRoute />);

		await act(() => {
			fireEvent.changeText(getByPlaceholderText('forum:creation.content.placeholder'), 'My $content$');
		});

		fireEvent.press(getByTestId("submit-button"));
		expect(callFunction).not.toHaveBeenCalled();
	});

	test("Not call submit cloud function when content is empty", async () => {
		const { getByTestId, getByPlaceholderText } = render(<ForumCreatePostRoute />);

		await act(() => {
			fireEvent.changeText(getByPlaceholderText('forum:creation.title.placeholder'), 'My title');
		});

		fireEvent.press(getByTestId("submit-button"));
		expect(callFunction).not.toHaveBeenCalled();
	});

	test("Call submit cloud function when parameters are valid.", async () => {
		const { getByTestId, getByPlaceholderText } = render(<ForumCreatePostRoute />);

		await act(() => {
			fireEvent.changeText(getByPlaceholderText('forum:creation.title.placeholder'), 'My title');
			fireEvent.changeText(getByPlaceholderText('forum:creation.content.placeholder'), 'My $content$');
		});

		fireEvent.press(getByTestId("submit-button"));
		expect(callFunction).toHaveBeenCalled();
	});
});
