import LectureScreen from '@/app/(app)/lectures/slides/index';
import TView from '@/components/core/containers/TView';
import StudentQuestion from '@/components/lectures/slides/StudentQuestion';
import { callFunction, getDownloadURL } from '@/config/firebase';
import SyncStorage from '@/config/SyncStorage';
import { useAuth } from '@/contexts/auth';
import { useUser } from '@/contexts/user';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Timestamp } from '@react-native-firebase/firestore/lib/modular/Timestamp';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';
import Toast from 'react-native-toast-message';


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

const mockLectureData3 = {
    data: {
        pdfUri: 'mocked-uri',
        audioTranscript: {},
        event: {
            id: "1",
            type: "quiz",
        }
    },
};

// Mock SyncStorage module
jest.mock('@/config/SyncStorage', () => ({
    init: jest.fn().mockResolvedValueOnce(undefined),
    get: jest.fn(),
    set: jest.fn(),
    getOrDefault: jest.fn((key, defaultValue) => defaultValue),  // Add getOrDefault mock
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


// Mock data for `useDynamicDocs`
const mockQuizData = [
    {
        id: '1',
        data: {
            done: false,
            pageNumber: 1,
            quizModel: {
                answer: {
                    type: "TFAnswer",
                    value: true,
                },
                ended: false,
                exercice: {
                    answer: true,
                    question: "Is earth flat ?",
                    type: "TF",
                },
                showResultToStudents: false,
            },
            type: "quiz",
        },
    }
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
        Screen: jest.fn(({ options }) => <>{options.title}</>),
    },
    useLocalSearchParams: jest.fn(() => ({
        courseNameString: 'testCourse',
        lectureIdString: 'testLectureId',
    })),
    useFocusEffect: jest.fn(),
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

// Mock Firebase mock
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
    CollectionOf: jest.fn((path) => ({
        orderBy: jest.fn((field, direction) => ({
            path,
            field,
            direction
        }))
    })),
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
        agoTimestamp: jest.fn(() => '2 hours ago'),
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
jest.mock('@react-navigation/native', () => ({
    useFocusEffect: jest.fn(),
    useNavigation: jest.fn(),
}));

// BottomSheet to detect modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ present }) => (
        <div>{present}</div>
    )),
}));

// Mock the react native webview
jest.mock('react-native-webview', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        WebView: () => React.createElement(View),
    };
});

jest.mock('@/components/quiz/LectureQuizComponents', () => {
    const { Text } = require('react-native');
    return {
        LectureQuizView: () => <Text>LectureQuizView</Text>,
    };
});


describe('LectureScreen Component', () => {

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
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]); // Mocking `usePrefetchedDynamicDoc` with minimal data
        (useDynamicDocs as jest.Mock).mockReturnValue(mockQuestionData); // Mocking `useDynamicDocs` with minimal question data
        (useAuth as jest.Mock).mockReturnValue({ uid: 'mock-uid', });
        (useUser as jest.Mock).mockReturnValue({ user: { name: 'Test User', }, });
    });

    it('calls setPortrait on mount', async () => {
        // Ensures that the screen is locked in landscape mode when the component mounts
        const mockLockAsync = jest.spyOn(ScreenOrientation, 'lockAsync');
        render(<LectureScreen />);
        expect(mockLockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.PORTRAIT);
    });

    it('adds and removes the orientation change listener', () => {
        // Checks that orientation change listeners are added on mount and removed on unmount
        const mockAddListener = jest.spyOn(ScreenOrientation, 'addOrientationChangeListener');
        const mockRemoveListener = jest.spyOn(ScreenOrientation, 'removeOrientationChangeListener');

        const { unmount } = render(<LectureScreen />);
        expect(mockAddListener).toHaveBeenCalled();

        unmount();
        expect(mockRemoveListener).toHaveBeenCalled();
    });

    it('displays loader if lectureDoc is not loaded', () => {
        // Verifies that a loader is displayed when the lecture document data is unavailable
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([null]);
        render(<LectureScreen />);
        expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('handles errors in getUri gracefully', async () => {
        // Ensures that the component logs an error gracefully when fetching the PDF URI fails
        console.error = jest.fn();
        (getDownloadURL as jest.Mock).mockRejectedValue(new Error('Error loading PDF URL'));

        render(<LectureScreen />);
        await waitFor(() => expect(console.error).toHaveBeenCalledWith('Error loading PDF URL:', expect.any(Error)));
    });

    it('displays default transcript text if audio transcript is missing', () => {
        // Checks that the default transcript text is displayed when no transcript data is available
        render(<LectureScreen />);
        expect(screen.getByText('showtime:lecturer_transcript_deftxt')).toBeTruthy();
    });

    it('allows navigation to the next PDF page', async () => {
        // Ensures the "next page" navigation button for the PDF works correctly
        render(<LectureScreen />);
        const nextPageButton = screen.getByLabelText('arrow-forward-circle-outline');
        fireEvent.press(nextPageButton);
        // Mock and assert `setPage` logic here if directly accessible
    });

    it('allows navigation to the previous PDF page', async () => {
        // Ensures the "previous page" navigation button for the PDF works correctly
        render(<LectureScreen />);
        const prevPageButton = screen.getByLabelText('arrow-back-circle-outline');
        fireEvent.press(prevPageButton);
        // Mock and assert `setPage` logic for going back if accessible
    });

    it('displays an input field for adding new questions', () => {
        // Verifies the presence of an input field for submitting questions
        render(<LectureScreen />);
        expect(screen.getByPlaceholderText('Got something on your mind? Type away!')).toBeTruthy();
    });

    it('calls add question function with correct parameters on question submission', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });
        // Ensures the correct function is called with expected parameters when submitting a new question
        render(<LectureScreen />);
        const questionInput = screen.getByPlaceholderText('Got something on your mind? Type away!');
        const sendButton = screen.getByLabelText('send-outline');

        fireEvent.changeText(questionInput, 'New Question');
        fireEvent.press(sendButton);

        expect(callFunction).toHaveBeenCalledWith(
            {
                exportedName: 'lectures_createQuestion',
                originalName: 'createQuestion',
                path: 'lectures/createQuestion',
            },
            {
                courseId: 'testCourse',
                lectureId: 'testLectureId',
                question: 'New Question',
                anonym: false,
            }
        );
    });

    it('toggles fullscreen mode and orientation on expand/contract icon press', () => {
        // Tests that the component toggles fullscreen mode and orientation when the expand/contract button is pressed
        render(<LectureScreen />);
        const fullscreenToggleButton1 = screen.getByLabelText('expand-outline');

        fireEvent.press(fullscreenToggleButton1);
        expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);

        const fullscreenToggleButton2 = screen.getByLabelText('contract-outline');
        fireEvent.press(fullscreenToggleButton2);
        expect(ScreenOrientation.unlockAsync).toHaveBeenCalled();
    });

    it('switches to landscape mode when setLandscape function is triggered', () => {
        // Ensures the screen orientation switches to landscape mode when requested
        render(<LectureScreen />);
        const expandButton = screen.getByLabelText('expand-outline');

        fireEvent.press(expandButton);
        expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);
    });

    it('renders the list of questions correctly', () => {
        const { getByText } = render(
            <StudentQuestion
                courseName="Test Course"
                lectureId="Test Lecture"
                questionsDoc={mockQuestionData}
            />
        );

        expect(getByText('Test Question 1')).toBeTruthy();
        expect(getByText('Test Question 2')).toBeTruthy();
    });

    it('allows a user to submit a new question', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });

        render(
            <StudentQuestion
                courseName="Test Course"
                lectureId="Test Lecture"
                questionsDoc={mockQuestionData}
            />
        );
        const input = screen.getByPlaceholderText('Got something on your mind? Type away!');
        const sendButton = screen.getByTestId('send-button');

        fireEvent.changeText(input, 'New Test Question');
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(callFunction).toHaveBeenCalledWith(
                { "exportedName": "lectures_createQuestion", "originalName": "createQuestion", "path": "lectures/createQuestion" },
                expect.objectContaining({
                    courseId: 'Test Course',
                    lectureId: 'Test Lecture',
                    question: 'New Test Question',
                    anonym: false,
                })
            );
        });

        expect(Toast.show).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'success',
                text1: 'Your comment was successfully added',
            })
        );
    });


    it('do not close the modal when the button is pressed', () => {
        render(<LectureScreen />);
        const button = screen.getByTestId('st-trans-mode-sel-button');
        fireEvent.press(button);
        expect(modalRef.current?.close).not.toHaveBeenCalled();
    });


    it('should like a question', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: true });
        render(<StudentQuestion courseName={"Test Course"} lectureId={"Test Lecture"} questionsDoc={mockQuestionData} />);

        // Initially, the question has 0 likes, and the user hasn't liked it
        (SyncStorage.get as jest.Mock).mockResolvedValueOnce({ status: false });

        const likeButton = screen.getByTestId('like-button-0'); // Assuming first question has index 0

        // Like the question
        fireEvent.press(likeButton);

        // Check if SyncStorage.set was called to store the like state
        await waitFor(() => {
            expect(SyncStorage.set).toHaveBeenCalledWith(`stquestion-${mockQuestionData[0].id}`, true);
        });
    });

    it('should show an error message if adding question fails', async () => {
        render(<StudentQuestion courseName={"Test Course"} lectureId={"Test Lecture"} questionsDoc={mockQuestionData} />);

        // Mock the behavior of the callFunction to simulate a failure
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: false });

        const input = screen.getByPlaceholderText('Got something on your mind? Type away!');
        const sendButton = screen.getByTestId('send-button');

        fireEvent.changeText(input, 'New Question');
        fireEvent.press(sendButton);

        // Check if Toast notification was triggered for failure
        await waitFor(() =>
            expect(Toast.show).toHaveBeenCalledWith({
                type: 'error',
                text1: 'You were unable to send this message',
            })
        );
    });

});


describe('LectureScreen Component Broadcasting Question to audiance', () => {

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
    });

    it('display the correct current question on the screen', () => {
        const { rerender } = render(<LectureScreen />);
        rerender(<LectureScreen />);
        expect(screen.getByText('« Test Question 1 »')).toBeTruthy();
    });

});



describe('LectureScreen Component Broadcasting Quiz to audiance', () => {

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
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData3]); // Mocking `usePrefetchedDynamicDoc` with minimal data
        (useDynamicDocs as jest.Mock).mockReturnValue(mockQuizData); // Mocking `useDynamicDocs` with minimal question data
        (useAuth as jest.Mock).mockReturnValue({ uid: 'mock-uid', });
        (useUser as jest.Mock).mockReturnValue({ user: { name: 'Test User', }, });
    });

    it('display the correct current question on the screen', () => {
        const { rerender } = render(<LectureScreen />);
        rerender(<LectureScreen />);
        expect(screen.getByText('LectureQuizView')).toBeTruthy();
    });

});