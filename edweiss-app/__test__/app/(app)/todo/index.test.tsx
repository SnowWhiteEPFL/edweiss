import TodoListScreen from '@/app/(app)/todo';
import t from '@/config/i18config';
import { useAuth } from '@/contexts/auth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';



jest.mock('../../../../components/todo/modal', () => {
    const TView = require('@/components/core/containers/TView').default;
    return {
        TodoModalDisplay: () => <TView testID="todo-modal-display" />,
        FilterModalDisplay: () => <TView testID="filter-modal-display" />,
    };
});



jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));

jest.mock('@/config/i18config', () => ({
    __esModule: true, // This ensures it's treated as a module with a default export
    default: jest.fn((key: string) => key), // Mock `t` to return the key as the translation
}));

jest.mock('expo-router', () => {
    const { Text } = require('react-native'); // Import Text inside the mock function scope
    return {
        router: { push: jest.fn() },
        Stack: {
            Screen: jest.fn(({ options }) => (
                <>
                    <Text testID="title">{options.title}</Text>
                    {options.headerRight && options.headerRight()},
                    {options.headerLeft && options.headerLeft()}
                </>
            )),
        },
    };
});

jest.mock('react-native-gesture-handler', () => {
    return {
        GestureHandlerRootView: ({ children }: { children: React.ReactNode; }) => children,
        GestureDetector: ({ children }: { children: React.ReactNode; }) => children,
        Swipeable: jest.fn().mockImplementation(({ children }) => children),
        State: {},
        Directions: {},
        Gesture: {
            GestureDetector: jest.fn(),
        },
        TouchableOpacity: jest.requireActual('react-native').TouchableOpacity,
    };
});


// Mock Firebase modules
jest.mock('@react-native-firebase/auth', () => ({
    currentUser: { uid: 'anonymous' },
    signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'anonymous' } })),
}));

// Mock useAuth hook to return a user with an `authUser` and `uid`
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({
        authUser: { uid: 'anonymous' }, // Mocked auth user with uid
    })),
}));

// Mock Google Signin module
jest.mock('@react-native-google-signin/google-signin', () => ({
    GoogleSignin: {
        configure: jest.fn(),
        signIn: jest.fn(() => Promise.resolve({ user: { id: 'mockedUserId', name: 'Mocked User' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(false)),
    },
}));


jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ present }) => (
        <div>{present}</div> // Simple mock
    )),
    BottomSheetView: jest.fn(({ children }) => (
        <div>{children}</div> // Simple mock
    )),
    BottomSheetBackdrop: jest.fn(),
}));



// Mock Firebase functions
jest.mock('@react-native-firebase/functions', () => {
    return {
        httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: { status: true } })))
    };
});

// Mock Storage module
jest.mock('@react-native-firebase/storage', () => {
    return {
        ref: jest.fn(() => ({
            putFile: jest.fn(() => Promise.resolve({})),
            getDownloadURL: jest.fn(() => Promise.resolve('mocked_download_url')),
            delete: jest.fn(() => Promise.resolve({}))
        })),
    };
});




jest.mock('@react-native-firebase/firestore', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        collection: jest.fn((path) => {
            if (path === 'users/anonymous/todos') {
                return {
                    // Mock for Firestore's doc method, which returns an object with set, get, and update methods
                    doc: jest.fn((id) => ({
                        set: jest.fn(() => Promise.resolve({})),
                        get: jest.fn(() =>
                            Promise.resolve({
                                exists: true,
                                data: () => ({ name: 'Sample Todo', status: 'yet' }),
                            })
                        ),
                        update: jest.fn(() => Promise.resolve({})),
                    })),
                    // Mock for add method to simulate adding a document
                    add: jest.fn(() => Promise.resolve({ id: '3' })),

                    // Mock for get method to return a list of documents
                    get: jest.fn(() =>
                        Promise.resolve({
                            docs: [
                                { id: '1', data: () => ({ name: 'Sample Todo', status: 'yet' }) },
                                { id: '2', data: () => ({ name: 'Another Todo', status: 'done' }) },
                            ],
                        })
                    ),

                    // Mock for onSnapshot to simulate real-time updates
                    onSnapshot: jest.fn((callback) => {
                        const mockSnapshot = {
                            docs: [
                                { id: '1', data: () => ({ name: 'Sample Todo', status: 'yet' }) },
                                { id: '2', data: () => ({ name: 'Another Todo', status: 'done' }) },
                            ],
                        };
                        callback(mockSnapshot); // Call callback with mock data
                        return jest.fn(); // Return unsubscribe function
                    }),

                    // Mock for setDocuments to handle setting documents
                    setDocuments: jest.fn(() => Promise.resolve({})),
                };
            }
            // Return default mocks for other paths
            return {
                doc: jest.fn(),
                add: jest.fn(),
                get: jest.fn(),
                onSnapshot: jest.fn(),
                setDocuments: jest.fn(),
            };
        }),
    })),
}));


// Mock the useAuth hook
(useAuth as jest.Mock).mockReturnValue({
    authUser: { uid: 'anonymous' },
});


// Default mock setup for useAuth and useDynamicDocs hooks
(useAuth as jest.Mock).mockReturnValue({
    authUser: { uid: 'anonymous' },
});

jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(() => [
        { id: '1', data: () => ({ name: 'Sample Todo', status: 'yet' }) },
        { id: '2', data: () => ({ name: 'Another Todo', status: 'done' }) },
    ])
}));
describe('TodoListScreen', () => {
    let modalRef: React.RefObject<BottomSheetModal>;


    beforeEach(() => {
        modalRef = {
            current: {
                present: jest.fn(),
                dismiss: jest.fn(),
                snapToIndex: jest.fn(),
                snapToPosition: jest.fn(),
                expand: jest.fn(),
                collapse: jest.fn(),
                close: jest.fn(),
                forceClose: jest.fn(),
            }
        };

        jest.clearAllMocks(); // Reset mocks before each test
    });

    it('renders the title, filter and add buttons from RouteHeader', () => {
        const { getByTestId } = render(<TodoListScreen />);
        expect(getByTestId("title")).toBeTruthy();
        expect(getByTestId('filter-button')).toBeTruthy();
        expect(getByTestId('add-todo-button')).toBeTruthy();
        expect(getByTestId('todo-modal-display')).toBeTruthy();
        expect(getByTestId('filter-modal-display')).toBeTruthy();
    });

    it('displays an empty message if no todos are available', () => {

        const { getByText } = render(<TodoListScreen />);
        expect(getByText(t('todo:list_empty'))).toBeTruthy();
    });

    it('navigates to create to-do screen when the add button is pressed', () => {
        const { getByTestId } = render(<TodoListScreen />);
        const addButton = getByTestId('add-todo-button');
        fireEvent.press(addButton);
        expect(router.push).toHaveBeenCalledWith('/(app)/todo/create');
    });



    it('do not close TodoModalDisplay when add button get pressed', async () => {
        const { getByTestId } = render(<TodoListScreen />);

        const todoItem = getByTestId('filter-button');
        fireEvent.press(todoItem);

        expect(modalRef.current?.close).not.toHaveBeenCalled();
    });

});;