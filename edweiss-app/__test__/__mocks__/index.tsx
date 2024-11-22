
/**
 * To refactor because those aren't working, we'll see.
 */

export namespace CommonMock {

	// export function mockAsyncStorage(disk?: any) {
	// 	return jest.mock('@react-native-async-storage/async-storage', () => ({
	// 		// __esModule: true,
	// 		setItem: jest.fn(),
	// 		getItem: jest.fn(),
	// 		removeItem: jest.fn(),
	// 		getAllKeys: jest.fn(() => Promise.resolve(Object.keys(disk))),
	// 		multiGet: jest.fn((keys) => Promise.resolve(keys.map((key: string) => disk[key]))),
	// 		multiSet: jest.fn(() => Promise.resolve()),
	// 		multiRemove: jest.fn(() => Promise.resolve())
	// 	}));
	// }

	// export function mockExpoRouter(args: { params: any }) {
	// 	return jest.mock('expo-router', () => ({
	// 		...jest.requireActual('expo-router'),
	// 		router: { push: jest.fn(), back: jest.fn() },
	// 		useLocalSearchParams: jest.fn(() => args.params),
	// 	}));
	// }

}
