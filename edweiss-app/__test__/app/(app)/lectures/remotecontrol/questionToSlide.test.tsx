import QuestionToSlideScreen from '@/app/(app)/lectures/remotecontrol/questionToSlide';
import TView from '@/components/core/containers/TView';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Timestamp } from '@react-native-firebase/firestore/lib/modular/Timestamp';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';


// Mock data for `usePrefetchedDynamicDoc` with any lecture event
const mockLectureData = {
    data: {
        pdfUri: 'mocked-uri',
        audioTranscript: {},
        event: {
            id: "",
            type: "invalid",
        }
    },
};


// Mock data for `usePrefetchedDynamicDoc` with any lecture event
const mockLectureData2 = {
    data: {
        pdfUri: 'mocked-uri',
        audioTranscript: {},
        event: {
            id: "1",
            type: "question",
        }
    },
};


// Mock SyncStorage module
jest.mock('@/config/SyncStorage', () => ({
    init: jest.fn().mockResolvedValueOnce(undefined), // Mock the init method
    get: jest.fn(),
    set: jest.fn(),
    // Mock other methods
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getAllKeys: jest.fn().mockResolvedValue(['key1', 'key2']),  // Mocking `getAllKeys`
    multiGet: jest.fn().mockResolvedValue([['key1', 'value1'], ['key2', 'value2']]),  // Mocking `multiGet`
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));
// Mock data for `useDynamicDocs`
const mockQuestionData = [
    {
        id: '1',
        data: {
            text: 'Test Question 1',
            anonym: false,
            userID: 'user1',
            likes: 5,
            username: 'User1',
            postedTime: Timestamp.now(), // Include postedTime as an ISO string
            answered: false,
        },
    },
    {
        id: '2',
        data: {
            text: 'Test Question 2',
            anonym: true,
            userID: 'mock-uid',
            likes: 3,
            username: '',
            postedTime: Timestamp.now(), // Include postedTime as an ISO string
            answered: false,
        },
    },
];

// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
}));

jest.mock('@/hooks/useListenToMessages', () => jest.fn());

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
    getDownloadURL: jest.fn(),
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
    useAuth: jest.fn(),                 // mock authentication
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
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
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));

// Mock the useUser hook
jest.mock('@/contexts/user', () => ({
    useUser: jest.fn(), // Mock the hook
}));

// BottomSheet to detect modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ present }) => (
        <div>{present}</div>
    )),
}));

describe('Question To Slide Test Suites', () => {

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

        jest.clearAllMocks();
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData2]); // Mocking `usePrefetchedDynamicDoc` with minimal data
        (useDynamicDocs as jest.Mock).mockReturnValue(mockQuestionData); // Mocking `useDynamicDocs` with minimal question data
        (useAuth as jest.Mock).mockReturnValue({ uid: 'mock-uid', });
        (useUser as jest.Mock).mockReturnValue({ user: { name: 'Test User', }, });
        (useLocalSearchParams as jest.Mock).mockReturnValue({ courseNameString: 'testCourse', lectureIdString: 'testLectureId' });
    });



    it('renders loading indicator when lectureDoc is not available', () => {
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([undefined]);
        render(<QuestionToSlideScreen />);
        expect(screen.getByTestId('quest-slide-activity-indicator')).toBeTruthy();
    });

    it('renders questions when data is available', () => {
        render(<QuestionToSlideScreen />);
        expect(screen.getByText('Test Question 1')).toBeTruthy();
        expect(screen.getByText('Test Question 2')).toBeTruthy();
    });

    it('opens modal when question is pressed', () => {
        render(<QuestionToSlideScreen />);
        const question = screen.getByText('Test Question 1');
        fireEvent.press(question);
        expect(BottomSheetModal).toHaveBeenCalled();
    });

    it('displays empty state when no questions are available', () => {
        (useDynamicDocs as jest.Mock).mockReturnValue([]);
        render(<QuestionToSlideScreen />);
        expect(screen.getByText('showtime:empty_question')).toBeTruthy();
    });
});
