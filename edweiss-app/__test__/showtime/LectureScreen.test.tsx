import LectureScreen from '@/app/(app)/lectures/slides/index';
import { getDownloadURL } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { FC, ReactNode } from 'react';

// Mock dependencies
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
}));

jest.mock('@/config/firebase', () => ({
    CollectionOf: jest.fn(),
    getDownloadURL: jest.fn(),
}));

jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
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

// Mock the RouteHeader component if it's using Stack.Screen
jest.mock('@/components/core/header/RouteHeader', () => {
    const MockRouteHeader: FC<{ children: ReactNode; }> = ({ children }) => <>{children}</>;
    return MockRouteHeader;
});

// Mock react-native-pdf to prevent native calls
jest.mock('react-native-pdf', () => {
    return () => <div data-testid="mock-pdf-viewer">PDF Viewer Mock</div>;
});

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

// Mock Data
const mockLectureData = {
    data: {
        pdfUri: 'mock-pdf-uri',
        audioTranscript: ['Transcript for Page 1', 'Transcript for Page 2'],
        questions: [
            { id: '1', question: 'Question 1' },
            { id: '2', question: 'Question 2' },
        ],
    },
};

describe('LectureScreen Component', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            courseNameString: 'mockCourse',
            lectureIdString: 'mockLectureId',
        });
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
        (getDownloadURL as jest.Mock).mockResolvedValue('mock-pdf-url');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the PDF viewer with the correct URI', async () => {
        // Render the LectureScreen component
        const { findByText } = render(<LectureScreen />);

        // Verify that getDownloadURL is called with the correct URI
        await waitFor(() => expect(getDownloadURL).toHaveBeenCalledWith('mock-pdf-uri'));

        // Assert that the rendered output contains the mock PDF URL
        const pdfUrlElement = await findByText('mock-pdf-url');
        expect(pdfUrlElement).toBeTruthy();
    });

    it('navigates to the next and previous pages correctly', async () => {
        const { findByText } = render(<LectureScreen />);

        // Navigate to the next page
        const nextButton = await findByText('arrow-forward-circle-outline'); // Update based on actual button text
        fireEvent.press(nextButton);
        const nextTranscript = await findByText('Transcript for Page 2');
        expect(nextTranscript).toBeTruthy();

        // Navigate to the previous page
        const prevButton = await findByText('arrow-back-circle-outline'); // Update based on actual button text
        fireEvent.press(prevButton);
        const previousTranscript = await findByText('Transcript for Page 1');
        expect(previousTranscript).toBeTruthy();
    });

    it('toggles fullscreen and locks orientation to landscape', async () => {
        const { findByText } = render(<LectureScreen />);
        const fullscreenButton = await findByText('expand-outline'); // Update based on actual button text

        // Toggle fullscreen on
        fireEvent.press(fullscreenButton);
        expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.LANDSCAPE);

        // Toggle fullscreen off
        fireEvent.press(fullscreenButton);
        expect(ScreenOrientation.unlockAsync).toHaveBeenCalled();
    });

    it('displays the correct transcript for the current page', async () => {
        const { findByText } = render(<LectureScreen />);

        // Assert that the initial transcript is displayed
        const initialTranscript = await findByText('Transcript for Page 1');
        expect(initialTranscript).toBeTruthy();

        // Simulate page change
        const nextButton = await findByText('arrow-forward-circle-outline'); // Update based on actual button text
        fireEvent.press(nextButton);
        const updatedTranscript = await findByText('Transcript for Page 2');
        expect(updatedTranscript).toBeTruthy();
    });


    it('renders questions and allows asking a new question', async () => {
        const { getByPlaceholderText, getByDisplayValue } = render(<LectureScreen />);

        const questionInput = getByPlaceholderText('Got something on your mind? Type away!');
        expect(questionInput).toBeTruthy();

        // Test typing into the question input
        fireEvent.changeText(questionInput, 'New question?');

        // Check the input value using getByDisplayValue
        expect(getByDisplayValue('New question?')).toBeTruthy();
    });
});
