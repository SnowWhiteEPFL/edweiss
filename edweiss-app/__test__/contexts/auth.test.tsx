import { AuthSessionProvider } from '@/contexts/auth';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

const firebaseUser = { displayName: "John Doe", uid: 'firebase-test-uid', email: 'firebase-test@example.com' };

jest.mock('@react-native-firebase/auth', () => ({
	__esModule: true,
	currentUser: firebaseUser,
	default: jest.fn(() => ({
		onAuthStateChanged: jest.fn((callback: (user: FirebaseAuthTypes.User | null) => void) => {
			callback(firebaseUser as FirebaseAuthTypes.User);
		})
	}))
}));

// const UsingAuthContext: ReactComponent<{}> = () => {
// 	const obj = useAuth();
// 	console.log(obj);
// 	return (<Text>{obj.authUser.displayName}</Text>);
// };

describe("Authentication Context Provider", () => {
	it("should render correctly", () => {
		const Provider = render(<AuthSessionProvider><Text>Some text</Text></AuthSessionProvider>).toJSON();
		expect(Provider).toMatchSnapshot();
	});

	// it("should not useAuth", () => {
	// 	const Component = render(
	// 		<AuthSessionProvider>
	// 			<UsingAuthContext />
	// 		</AuthSessionProvider>
	// 	).toJSON();

	// 	act(() => {
	// 		expect(Component).toMatchSnapshot();
	// 	});
	// });
});
