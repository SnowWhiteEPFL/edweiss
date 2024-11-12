/**
 * @file index.test.tsx
 * @description Test suite for the RemoteControlScreen component in the Edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------


import RemoteControlScreen, { setPortrait, startRecording, stopRecording } from '@/app/(app)/lectures/remotecontrol';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Voice from '@react-native-voice/voice';
import { act, render } from '@testing-library/react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { ReactNode } from 'react';

// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
}));

jest.mock('expo-router', () => ({
    router: { push: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</> // Simulate rendering the title for the test
        )),
    },
    useLocalSearchParams: jest.fn(() => ({ courseNameString: 'testCourse', lectureIdString: 'testLectureId' }))
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

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
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

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(),
    getDownloadURL: jest.fn(),
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

/* THIS IS THE PROBLEM
jest.mock('react-native', () => ({
    Vibration: { vibrate: jest.fn() }
}));*/

jest.mock('@react-native-voice/voice', () => ({
    start: jest.fn(),
    stop: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechError: jest.fn(),
}));

// Mocked data and utility functions
const mockLectureData = {
    data: {
        nbOfPages: 5,
    },
}
const mockParams = { courseNameString: 'testCourse', lectureIdString: 'testLectureId' };

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),  // Note the double array to match [lectureDoc]
}));

// We need this
jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: {},
    // Mock any other functions from expo-modules-core if needed
}));

jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    return {
        Ionicons: (props: React.ComponentProps<'div'>) => React.createElement('div', props),
    };
});

// Mock the AbstractRmtCtl component
jest.mock('@/components/lectures/remotecontrol/abstractRmtCtl', () => {
    const TView = require('@/components/core/containers/TView').default;
    return {
        AbstractRmtCrl: () => <TView testID="abstract-rmt-ctl" />,
    };
});


// ------------------------------------------------------------
// ---------   ST! Remote Control Screen Tests suites   -------
// ------------------------------------------------------------


describe('RemoteControlScreen Test Suite', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('calls startRecording to begin voice recording', async () => {
        await act(async () => {
            await startRecording();
        });

        expect(Voice.start).toHaveBeenCalledWith('en-US');
    });

    it('calls stopRecording to end voice recording', async () => {
        await act(async () => {
            await stopRecording();
        });

        expect(Voice.stop).toHaveBeenCalled();
    });

    it('calls setPortrait to lock orientation to portrait mode', async () => {
        await act(async () => {
            await setPortrait();
        });

        expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    });

    it('renders the RemoteControlScreen component', () => {
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
        const { getByTestId } = render(<RemoteControlScreen />);
        //renderer.debug();
        expect(getByTestId('abstract-rmt-ctl')).toBeTruthy();
    });
});