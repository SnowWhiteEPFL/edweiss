/**
 * @file index.test.tsx
 * @description Test suite for the RemoteControlScreen component in the Edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import RemoteControlScreen from '@/app/(app)/lectures/remotecontrol';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { render } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import { FC, default as React, ReactNode } from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';

// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
}));

jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => {
    const actualNav = jest.requireActual('@react-navigation/native-stack');
    return {
        ...actualNav,
        createNativeStackNavigator: jest.fn(() => ({
            Navigator: ({ children }: { children: ReactNode; }) => <>{children}</>,
            Screen: ({ children }: { children: ReactNode; }) => <>{children}</>,
        })),
    };
});

jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),					// mock authentication
}));

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({ // mock google sign-in
    GoogleSignin: {
        configure: jest.fn(),
        hasPlayServices: jest.fn(() => Promise.resolve(true)),
        signIn: jest.fn(() => Promise.resolve({ user: { id: 'test-id', email: 'test@example.com' } })),
        signOut: jest.fn(() => Promise.resolve()),
        isSignedIn: jest.fn(() => Promise.resolve(true)),
        getTokens: jest.fn(() => Promise.resolve({ idToken: 'test-id-token', accessToken: 'test-access-token' })),
    },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));


jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

// Mock the RouteHeader component if it's using Stack.Screen
jest.mock('@/components/core/header/RouteHeader', () => {
    const MockRouteHeader: FC<{ children: ReactNode; }> = ({ children }) => <>{children}</>;
    return MockRouteHeader;
});

jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn()
}));



// Mock react-native-blob-util to prevent NativeEventEmitter errors
jest.mock('react-native-blob-util', () => ({
    fs: {
        dirs: {
            DocumentDir: 'mockDocumentDir',
        },
    },
    config: jest.fn(() => ({
        fetch: jest.fn(),
    })),
}));

// Mock Firebase Messaging to avoid NativeEventEmitter errors
jest.mock('@react-native-firebase/messaging', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        onMessage: jest.fn(),
        onNotificationOpenedApp: jest.fn(),
        getInitialNotification: jest.fn(),
    })),
}));




// Mock react-native-pdf to prevent native calls
jest.mock('react-native-pdf', () => {
    return () => <div data-testid="mock-pdf-viewer">PDF Viewer Mock</div>;
});



// Updated mock for expo-screen-orientation
jest.mock('expo-screen-orientation', () => ({
    lockAsync: jest.fn(),
    unlockAsync: jest.fn(),
    OrientationLock: { LANDSCAPE: 'LANDSCAPE', PORTRAIT_UP: 'PORTRAIT_UP' },
    addOrientationChangeListener: jest.fn((callback) => {
        callback({ orientationInfo: 'mockOrientation' });
        return {
            remove: jest.fn(),
        };
    }),
    removeOrientationChangeListener: jest.fn(),
}));

jest.mock('react-native', () => ({
    Vibration: { vibrate: jest.fn() }
}));

jest.mock('@react-native-voice/voice', () => ({
    start: jest.fn(),
    stop: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechError: jest.fn(),
}));




// Mocked data and utility functions
const mockLectureData = {
    nbOfPages: 5,
    data: { nbOfPages: 5 }
};
const mockParams = { courseNameString: 'testCourse', lectureIdString: 'testLectureId' };




// ------------------------------------------------------------
// ---------   ST! Remote Control Screen Tests suites   -------
// ------------------------------------------------------------


describe('RemoteControlScreen Tests Suites', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
        jest.clearAllMocks();
    });

    it('renders all elements on the screen', () => {
        const { getByText, getByTestId } = render(<RemoteControlScreen />);
        // expect(getByText('Lecture\'s Slides')).toBeTruthy();
        expect(getByText('showtime:showtime_title')).toBeTruthy();
        expect(getByText('showtime:rmt_cntl_title')).toBeTruthy();
        expect(getByTestId('mic-button')).toBeTruthy();
        expect(getByTestId('prev-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
    });

    // it('renders loading indicator when lectureDoc is undefined', () => {
    //     (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([undefined]);
    //     const { getByTestId } = render(<RemoteControlScreen />);
    //     expect(getByTestId('activity-indicator')).toBeTruthy();
    // });

    // it('sets screen orientation to portrait when lectureDoc is loaded', async () => {
    //     render(<RemoteControlScreen />);
    //     await waitFor(() => {
    //         expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    //     });
    // });

    // it('starts and stops recording when mic button is pressed', async () => {
    //     const { getByTestId } = render(<RemoteControlScreen />);
    //     const micButton = getByTestId('mic-button');

    //     // Start recording
    //     fireEvent.press(micButton);
    //     await waitFor(() => expect(Voice.start).toHaveBeenCalledWith('en-US'));
    //     expect(Voice.start).toHaveBeenCalledTimes(1);

    //     // Stop recording
    //     fireEvent.press(micButton);
    //     await waitFor(() => expect(Voice.stop).toHaveBeenCalled());
    //     expect(Voice.stop).toHaveBeenCalledTimes(1);
    // });

    // it('navigates to the next slide and starts/stops recording appropriately', async () => {
    //     const { getByTestId } = render(<RemoteControlScreen />);
    //     const nextButton = getByTestId('next-button');

    //     fireEvent.press(nextButton);
    //     expect(callFunction).toHaveBeenCalledWith(expect.any(String), { page: 2 });
    //     expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    // });

    // it('navigates to the previous slide and starts/stops recording appropriately', async () => {
    //     const { getByTestId } = render(<RemoteControlScreen />);
    //     const prevButton = getByTestId('prev-button');

    //     fireEvent.press(prevButton);
    //     expect(callFunction).toHaveBeenCalledWith(expect.any(String), { page: 1 });
    //     expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    // });

    // it('handles audio transcription and updates the slide transcription', async () => {
    //     const mockSpeechResults = { value: ['Test transcription'] };
    //     const { getByTestId } = render(<RemoteControlScreen />);

    //     // Trigger onSpeechResults with mock data
    //     await waitFor(() => Voice.onSpeechResults(mockSpeechResults));

    //     expect(callFunction).toHaveBeenCalledWith('addAudioTranscript', {
    //         courseId: 'testCourse',
    //         lectureId: 'testLectureId',
    //         pageNumber: 1,
    //         transcription: 'Test transcription'
    //     });
    // });

    // it('handles errors in transcription', async () => {
    //     const mockError = { error: 'An error occurred' };
    //     const consoleSpy = jest.spyOn(console, 'log');

    //     render(<RemoteControlScreen />);
    //     await waitFor(() => Voice.onSpeechError(mockError));
    //     expect(consoleSpy).toHaveBeenCalledWith(mockError.error);
    // });
});




// describe('RemoteControlScreen Tests Suites', () => {
//     beforeEach(() => {
//         (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
//         (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
//         jest.clearAllMocks();
//     });

// it('renders loading indicator when lectureDoc is undefined', () => {
//     (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([undefined]);
//     const { getByTestId } = render(<RemoteControlScreen />);
//     expect(getByTestId('activity-indicator')).toBeTruthy();
// });

// it('renders the main screen when lectureDoc is available', () => {
//     const { getByText } = render(<RemoteControlScreen />);
//     expect(getByText("Lecture's Slides")).toBeTruthy();
// });

// it('sets screen orientation to portrait when lectureDoc is loaded', async () => {
//     render(<RemoteControlScreen />);
//     await waitFor(() => {
//         expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.PORTRAIT_UP);
//     });
// });

// it('starts and stops recording when mic button is pressed', async () => {
//     const { getByTestId } = render(<RemoteControlScreen />);
//     const micButton = getByTestId('mic-button');

//     // Start recording
//     fireEvent.press(micButton);
//     await waitFor(() => expect(Voice.start).toHaveBeenCalledWith('en-US'));
//     expect(Voice.start).toHaveBeenCalledTimes(1);

//     // Stop recording
//     fireEvent.press(micButton);
//     await waitFor(() => expect(Voice.stop).toHaveBeenCalled());
//     expect(Voice.stop).toHaveBeenCalledTimes(1);
// });

// it('navigates to the next slide and starts/stops recording appropriately', async () => {
//     const { getByTestId } = render(<RemoteControlScreen />);
//     const nextButton = getByTestId('next-button');

//     fireEvent.press(nextButton);
//     expect(callFunction).toHaveBeenCalledWith(expect.any(String), { page: 2 });
//     expect(Vibration.vibrate).toHaveBeenCalledWith(100);
// });

// it('navigates to the previous slide and starts/stops recording appropriately', async () => {
//     const { getByTestId } = render(<RemoteControlScreen />);
//     const prevButton = getByTestId('prev-button');

//     fireEvent.press(prevButton);
//     expect(callFunction).toHaveBeenCalledWith(expect.any(String), { page: 1 });
//     expect(Vibration.vibrate).toHaveBeenCalledWith(100);
// });

// it('handles audio transcription and updates the slide transcription', async () => {
//     const mockSpeechResults = { value: ['Test transcription'] };
//     const { getByTestId } = render(<RemoteControlScreen />);

//     // Trigger onSpeechResults with mock data
//     await waitFor(() => Voice.onSpeechResults(mockSpeechResults));

//     expect(callFunction).toHaveBeenCalledWith('addAudioTranscript', {
//         courseId: 'testCourse',
//         lectureId: 'testLectureId',
//         pageNumber: 1,
//         transcription: 'Test transcription'
//     });
// });

// it('handles errors in transcription', async () => {
//     const mockError = { error: 'An error occurred' };
//     const consoleSpy = jest.spyOn(console, 'log');

//     render(<RemoteControlScreen />);
//     await waitFor(() => Voice.onSpeechError(mockError));
//     expect(consoleSpy).toHaveBeenCalledWith(mockError.error);
// });
// });
