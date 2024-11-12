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
import { TouchableOpacityProps } from 'react-native';


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
    useAuth: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
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



// Mock the RouteHeader component if it's using Stack.Screen
jest.mock('@/components/core/header/RouteHeader', () => {
    const MockRouteHeader: FC<{ children: ReactNode; }> = ({ children }) => <>{children}</>;
    return MockRouteHeader;
});


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


jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
}));


// Mocked data and utility functions
const mockLectureData = {
    nbOfPages: 5,
    data: { nbOfPages: 5 }
};
const mockParams = { courseNameString: 'testCourse', lectureIdString: 'testLectureId' };


// AbstractEditor for to dos
jest.mock('@/components/lectures/remotecontrol/abstractRmtCtl', () => {
    const TView = require('@/components/core/containers/TView').default;
    return {
        AbstractRmtCtl: () => <TView testID="abstract-rmt-ctl" />,
    };
});


// ------------------------------------------------------------
// ---------   ST! Remote Control Screen Tests suites   -------
// ------------------------------------------------------------

describe('RemoteControlScreen', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
    });

    it('should display the AbstractRmtCtl component', () => {
        const { getByTestId } = render(<RemoteControlScreen />);
        expect(getByTestId('abstract-rmt-ctl')).toBeTruthy();
    });
});
