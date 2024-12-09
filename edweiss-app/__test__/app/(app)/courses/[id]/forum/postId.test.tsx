import ForumPostRoute from '@/app/(app)/courses/[id]/forum/[postId]';
import { Document, callFunction } from '@/config/firebase';
import { Forum } from '@/model/forum';
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

jest.mock('@/hooks/firebase/firestore', () => ({
	usePrefetchedDynamicDoc: jest.fn(() => ([{
		id: "post-id",
		data: {
			anonymous: false,
			answered: false,
			byId: "user-id",
			byName: "user",
			content: "hello $content$",
			createdAt: { seconds: 0, nanoseconds: 0 },
			likes: 10,
			numberOfAnswers: 1,
			tags: [],
			title: "post title"
		}
	} satisfies Document<Forum.Post>])),
	useCachedDynamicDocs: jest.fn(() => ([{
		id: "answer-id1",
		data: {
			byId: "user-id1",
			byName: "name",
			anonymous: false,
			content: "content",
			createdAt: { seconds: 0, nanoseconds: 0 },
			likes: 5,
			favorite: false
		}
	}] satisfies Document<Forum.Answer>[]))
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
	useLocalSearchParams: jest.fn(() => ({ params: JSON.stringify({ courseId: "edweiss-demo", postId: "post-id", prefetchedPost: undefined }) }))
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

jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: jest.fn(() => ({
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
	}))
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
	it("should render answers correctly", () => {
		const { getByTestId } = render(<ForumPostRoute />);
		expect(getByTestId('answer-answer-id1')).toBeTruthy();
	});

	// it("should render the 'submit an answer' button when answer is provided", async () => {
	// 	const { getByTestId, getByPlaceholderText } = render(<ForumPostRoute />);

	// 	await act(async () => {
	// 		await userEvent.paste(getByPlaceholderText('forum:answer-box.placeholder'), 'My $answer$');
	// 	});

	// 	expect(getByTestId("submit-answer")).toBeTruthy();
	// });

	it("should submit an answer when the button is pressed and that an answer is provided", async () => {
		const { getByTestId, getByPlaceholderText } = render(<ForumPostRoute />);

		await act(() => {
			fireEvent.changeText(getByPlaceholderText('forum:answer-box.placeholder'), 'My $answer$');
		});

		await act(() => {
			fireEvent.press(getByTestId("submit-answer"));
		});

		expect(callFunction).toHaveBeenCalledWith(Forum.Functions.createAnswer, {
			courseId: 'edweiss-demo',
			postId: 'post-id',
			content: 'My $answer$'
		});
	});

	it("should like the post when the like button is pressed", async () => {
		const { getByTestId } = render(<ForumPostRoute />);

		await act(() => {
			fireEvent.press(getByTestId("like"));
		});

		expect(callFunction).toHaveBeenCalledWith(Forum.Functions.setLikePost, {
			courseId: 'edweiss-demo',
			postId: 'post-id',
			liked: true
		});
	});
});
