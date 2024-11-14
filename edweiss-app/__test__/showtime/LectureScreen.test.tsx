import LectureScreen from '@/app/(app)/lectures/slides/index';
import TView from '@/components/core/containers/TView';
import { callFunction } from '@/config/firebase';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';

// Mock data for `usePrefetchedDynamicDoc`
const mockLectureData = {
    data: {
        pdfUri: 'mocked-uri',
        audioTranscript: {},
    },
};

// Mock data for `useDynamicDocs`
const mockQuestionData = [
    { id: '1', data: { text: 'Mock Question' } },
];


// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
}));

// Expo router
jest.mock('expo-router', () => ({
    router: { push: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</>
        )),
    },
    useLocalSearchParams: jest.fn(() => ({ courseNameString: 'testCourse', lectureIdString: 'testLectureId' }))
}));

// Firebase Messaging to avoid NativeEventEmitter errors
jest.mock('@react-native-firebase/messaging', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        onMessage: jest.fn(),
        onNotificationOpenedApp: jest.fn(),
        getInitialNotification: jest.fn(),
    })),
}));

// Mock for react-native-pdf
jest.mock('react-native-pdf', () => 'Pdf');

// Mock for react-native-blob-util to avoid NativeEventEmitter issues
jest.mock('react-native-blob-util', () => ({
    fs: {
        dirs: {
            DocumentDir: '/mocked/document/dir',
            CacheDir: '/mocked/cache/dir',
        },
        exists: jest.fn(),
        readFile: jest.fn(),
        unlink: jest.fn(),
    },
    config: jest.fn(),
    session: jest.fn(),
}));

jest.mock('@react-native-firebase/storage', () => ({
    ref: jest.fn(() => ({
        getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/test.pdf')), // Ensure it's here
        putFile: jest.fn(() => Promise.resolve({ state: 'success' })),
    })),
}));

// Firebase mock
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    CollectionOf: jest.fn((path: string) => `MockedCollection(${path})`), // Mocking CollectionOf to return a simple string or mock object
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
    useDynamicDocs: jest.fn(),
}));

jest.mock('expo-screen-orientation', () => ({
    unlockAsync: jest.fn(),
    lockAsync: jest.fn(),
    addOrientationChangeListener: jest.fn(),
    removeOrientationChangeListener: jest.fn(),
    Orientation: {
        PORTRAIT_UP: 'PORTRAIT_UP',  // Correctly mock the values for portrait
        LANDSCAPE_LEFT: 'LANDSCAPE_LEFT',
        LANDSCAPE_RIGHT: 'LANDSCAPE_RIGHT',
        PORTRAIT_DOWN: 'PORTRAIT_DOWN',
    },
    OrientationLock: {
        LANDSCAPE: 'LANDSCAPE',  // Define the LANDSCAPE value here
        PORTRAIT: 'PORTRAIT',    // Mock other necessary values if needed
    },
}));

jest.mock('@react-native-firebase/auth', () => ({
    // Mock Firebase auth methods you use in your component
    signInWithCredential: jest.fn(() => Promise.resolve({ user: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' } })),
    signOut: jest.fn(() => Promise.resolve()),
    currentUser: { uid: 'firebase-test-uid', email: 'firebase-test@example.com' },
}));

jest.mock('@react-native-firebase/firestore', () => {
    const mockCollection = jest.fn(() => ({
        doc: jest.fn(() => ({
            set: jest.fn(() => Promise.resolve()),
            get: jest.fn(() => Promise.resolve({ exists: true, data: () => ({ field: 'value' }) })),
        })),
    }));

    // Ensure firestore is mocked as both a function and an object with methods
    return {
        __esModule: true,
        default: jest.fn(() => ({
            collection: mockCollection,
        })),
        collection: mockCollection
    };
});

// Mock Firebase Functions
jest.mock('@react-native-firebase/functions', () => ({
    httpsCallable: jest.fn(() => () => Promise.resolve({ data: 'function response' })),
}));

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),					// mock authentication
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Application Route
jest.mock('@/constants/Component', () => ({
    ApplicationRoute: jest.fn(),
}));

jest.mock('@/utils/time', () => ({
    Time: {
        fromDate: jest.fn(),
    },
}));

jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});
jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});
jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});


jest.doMock('react-native-gesture-handler', () => {
    return {
        Swipeable: ({ onSwipeableOpen, children }: { onSwipeableOpen: Function, children: React.ReactNode; }) => {
            return (
                <TView
                    data-testid="swipe-component"
                    onTouchStart={() => {
                        if (onSwipeableOpen) {
                            onSwipeableOpen('right'); // Simuler un swipe à droite
                        }
                    }}
                >
                    {children}
                </TView>
            );
        }
    };
});

// Mock for @expo/vector-icons to render a div with accessibility label
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    return {
        Ionicons: ({ name, onPress, ...props }: { name: string, onPress?: () => void }) => (
            <div {...props} onClick={onPress} data-testid={name} aria-label={name} />
        ),
    };
});

describe('LectureScreen Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]); // Mocking `usePrefetchedDynamicDoc` with minimal data
        (useDynamicDocs as jest.Mock).mockReturnValue(mockQuestionData); // Mocking `useDynamicDocs` with minimal question data
    });

    it('displays default transcript text if audio transcript is missing', () => {
        render(<LectureScreen />);
        expect(screen.getByText('showtime:lecturer_transcript_deftxt')).toBeTruthy();
    });

    it('allows navigation to the next PDF page', async () => {
        render(<LectureScreen />);
        const nextPageButton = screen.getByLabelText('arrow-forward-circle-outline');
        fireEvent.press(nextPageButton);
        // Mock and assert `setPage` logic here if directly accessible
    });

    it('allows navigation to the previous PDF page', async () => {
        render(<LectureScreen />);
        const prevPageButton = screen.getByLabelText('arrow-back-circle-outline');
        fireEvent.press(prevPageButton);
        // Mock and assert `setPage` logic for going back if accessible
    });

    it('displays an input field for adding new questions', () => {
        render(<LectureScreen />);
        expect(screen.getByPlaceholderText('Got something on your mind? Type away!')).toBeTruthy();
    });

    it('calls add question function with correct parameters on question submission', async () => {
        render(<LectureScreen />);
        const questionInput = screen.getByPlaceholderText('Got something on your mind? Type away!');
        const sendButton = screen.getByLabelText('send-outline');

        fireEvent.changeText(questionInput, 'New Question');
        fireEvent.press(sendButton);

        // Adjusting the expected call to match the actual structure of the function call
        expect(callFunction).toHaveBeenCalledWith(
            {
                exportedName: 'lectures_createQuestion',
                originalName: 'createQuestion',
                path: 'lectures/createQuestion',
            },
            {
                courseId: 'testCourse',
                lectureId: 'testLectureId',  // Ensure this is correct
                question: 'New Question',
            }
        );
    });


    it('toggles fullscreen mode and orientation on expand/contract icon press', () => {
        render(<LectureScreen />);
        const fullscreenToggleButton = screen.getByLabelText('expand-outline');

        fireEvent.press(fullscreenToggleButton);
        expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);

        fireEvent.press(fullscreenToggleButton);
        expect(ScreenOrientation.unlockAsync).toHaveBeenCalled();
    });

    it('switches to landscape mode when setLandscape function is triggered', () => {
        render(<LectureScreen />);
        const expandButton = screen.getByLabelText('expand-outline');

        fireEvent.press(expandButton);
        expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);
    });
});