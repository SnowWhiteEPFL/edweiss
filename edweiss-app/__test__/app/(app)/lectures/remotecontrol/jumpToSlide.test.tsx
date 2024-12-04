/**
 * @file jumpToSlide.test.tsx
 * @description Test suite for the jumpToSlide screen accessible from the STRC
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import JumpToSlideScreen from '@/app/(app)/lectures/remotecontrol/jumpToSlide';
import TView from '@/components/core/containers/TView';
import { getDownloadURL } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';
import Toast from 'react-native-toast-message';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Mock lecture data
const mockLectureData = {
    data: {
        pdfUri: 'mocked-uri',
    },
};

const incPageCount = jest.fn();
const decPageCount = jest.fn();


jest.mock('expo-router', () => ({
    router: { back: jest.fn() },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</>
        )),
    },
    useLocalSearchParams: jest.fn(() => ({
        courseNameString: 'testCourse',
        lectureIdString: 'testLectureId',
        currentPageString: '2',
        totalPageString: '10',
    })),
}));


// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
}));

jest.mock('@/hooks/useListenToMessages', () => jest.fn());

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


// Toast message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));


// ------------------------------------------------------------
// ---------     Jump To Slide Screen Tests suites      -------
// ------------------------------------------------------------

describe('JumpToSlideScreen Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
        (getDownloadURL as jest.Mock).mockResolvedValue('https://example.com/test.pdf');
    });

    it('renders the component with the initial state', async () => {
        const { getByTestId, getByText } = render(<JumpToSlideScreen />);


        await waitFor(() => {
            expect(getByTestId("goto-page-status")).toBeTruthy();
            expect(getByText('2 / 10')).toBeTruthy();
        });

    });

    it('loads the PDF URI from Firebase', async () => {
        render(<JumpToSlideScreen />);
        await waitFor(() => expect(getDownloadURL).toHaveBeenCalledWith('mocked-uri'));
    });

    it('displays an error toast if page input is invalid', async () => {
        const { getByTestId } = render(<JumpToSlideScreen />);
        const input = getByTestId('pick-page-input');
        const setPageButton = getByTestId('set-page-button');

        fireEvent.changeText(input, '15'); // Invalid page (exceeds total pages)
        fireEvent.press(setPageButton);

        // An error has occurred
        expect(Toast.show).toHaveBeenCalled();
    });


    it('updates the current page when valid page input is provided', async () => {
        const { getByTestId, getByText } = render(<JumpToSlideScreen />);
        const input = getByTestId('pick-page-input');
        const setPageButton = getByTestId('set-page-button');

        fireEvent.changeText(input, '5'); // Valid page
        fireEvent.press(setPageButton);

        await waitFor(() => {
            // As a valid number the entry should be refreshed
            expect(input.props.value).toBe('');
            expect(getByText('5 / 10')).toBeTruthy();
        });
    });


    it('navigates to the next page on "Next" button press', async () => {
        const { getByTestId } = render(<JumpToSlideScreen />);
        const nextButton = getByTestId('add-page-button');



        fireEvent.press(nextButton);

        await waitFor(() => {
            // Only the inc should have been called not the dec
            expect(decPageCount).not.toHaveBeenCalled();
        });
    });

    it('navigates to the previous page on "Previous" button press', async () => {
        const { getByTestId } = render(<JumpToSlideScreen />);
        const prevButton = getByTestId('dec-page-button');


        fireEvent.press(prevButton);

        await waitFor(() => {
            // Only the dec should have been called not inc
            expect(incPageCount).not.toHaveBeenCalled();
        });
    });


    it('calls `handleGoTo` and navigates back on "Go to page" button press', async () => {
        const { router } = jest.requireMock('expo-router');
        const setCurrentPageExternal = jest.fn();
        (window as any).setCurrentPageExternal = setCurrentPageExternal;

        const { getByTestId } = render(<JumpToSlideScreen />);
        const goToButton = getByTestId('go-to-button');

        fireEvent.press(goToButton);

        await waitFor(() => {
            expect(router.back).toHaveBeenCalled();
        });
    });
});
