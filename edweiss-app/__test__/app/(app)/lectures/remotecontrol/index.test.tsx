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

// Application navigation
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

// Authentication mock
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));

// Library Settings mock 
jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));

// Async storage for the pdf as it is stored in FBcloud storage
jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

// Firebase mock
jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(),
    getDownloadURL: jest.fn(),
    callFunction: jest.fn()
}));

// react-native-blob-util to prevent NativeEventEmitter errors
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

// Firebase Messaging to avoid NativeEventEmitter errors
jest.mock('@react-native-firebase/messaging', () => ({
    __esModule: true,
    default: jest.fn(() => ({
        onMessage: jest.fn(),
        onNotificationOpenedApp: jest.fn(),
        getInitialNotification: jest.fn(),
    })),
}));

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

// Voice handler
jest.mock('@react-native-voice/voice', () => ({
    start: jest.fn(),
    stop: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechError: jest.fn(),
}));


// 
jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),  // Note the double array to match [lectureDoc]
}));

// The expo core modules for the voice support
jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: {},
}));

// Useful for the prev-next button as they only contain icons
jest.mock('@expo/vector-icons', () => {
    const React = require('react');
    return {
        Ionicons: (props: React.ComponentProps<'div'>) => React.createElement('div', props),
    };
});

// Mocked Lecture data
// Note: this contains only the amount of information needed by the
// rmctrl do not reuse it later if you require a full lectureDoc mock data
const mockLectureData = {
    data: {
        nbOfPages: 5,
    },
}

// Mock the AbstractRmtCtl component
// Note: as we are mocking it this way, the lines in which we 
//       put it argument, won't be convered.
//       However, acting this way allow us to be able test idently the voice
//       framework from the UI, apllying thus the MVVM model in a more consistent way.
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

    it('handles error when starting voice recording', async () => {
        const mockError = new Error('Voice start error');
        (Voice.start as jest.Mock).mockImplementationOnce(() => {
            throw mockError;
        });

        console.log = jest.fn();

        await act(async () => {
            await startRecording();
        });

        expect(console.log).toHaveBeenCalledWith(mockError);
    });

    it('handles error when stopping voice recording', async () => {
        const mockError = new Error('Voice stop error');
        (Voice.stop as jest.Mock).mockImplementationOnce(() => {
            throw mockError;
        });

        console.log = jest.fn();

        await act(async () => {
            await stopRecording();
        });

        expect(console.log).toHaveBeenCalledWith(mockError);
    });
});