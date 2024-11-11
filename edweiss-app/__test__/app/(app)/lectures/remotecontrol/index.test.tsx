/**
 * @file index.test.tsx
 * @description Test suite for the RemoteControlScreen component in the Edweiss app
 * @author Adamm Alaoui
 */

import RemoteControlScreen from '@/app/(app)/lectures/remotecontrol';
import { callFunction } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Voice from '@react-native-voice/voice';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { Vibration } from 'react-native';



// Mock external dependencies
jest.mock('@react-native-voice/voice');
jest.mock('expo-screen-orientation');
jest.mock('react-native', () => ({
    Vibration: { vibrate: jest.fn() }
}));
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn()
}));
jest.mock('@/hooks/firebase/firestore');

jest.mock('@react-native-voice/voice', () => ({
    start: jest.fn(),
    stop: jest.fn(),
    onSpeechResults: jest.fn(),
    onSpeechError: jest.fn(),
}));



// Expo router with stack screen to test up buttons and title
jest.mock('expo-router', () => {
    const { Text } = require('react-native');
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

// Mocked data and utility functions
const mockLectureData = {
    nbOfPages: 5,
    data: { nbOfPages: 5 }
};
const mockParams = { courseNameString: 'testCourse', lectureIdString: 'testLectureId' };

describe('RemoteControlScreen', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue(mockParams);
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureData]);
        jest.clearAllMocks();
    });

    it('renders loading indicator when lectureDoc is undefined', () => {
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([undefined]);
        const { getByTestId } = render(<RemoteControlScreen />);
        expect(getByTestId('activity-indicator')).toBeTruthy();
    });

    it('renders the main screen when lectureDoc is available', () => {
        const { getByText } = render(<RemoteControlScreen />);
        expect(getByText("Lecture's Slides")).toBeTruthy();
    });

    it('sets screen orientation to portrait when lectureDoc is loaded', async () => {
        render(<RemoteControlScreen />);
        await waitFor(() => {
            expect(ScreenOrientation.lockAsync).toHaveBeenCalledWith(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        });
    });

    it('starts and stops recording when mic button is pressed', async () => {
        const { getByTestId } = render(<RemoteControlScreen />);
        const micButton = getByTestId('mic-button');

        // Start recording
        fireEvent.press(micButton);
        await waitFor(() => expect(Voice.start).toHaveBeenCalledWith('en-US'));
        expect(Voice.start).toHaveBeenCalledTimes(1);

        // Stop recording
        fireEvent.press(micButton);
        await waitFor(() => expect(Voice.stop).toHaveBeenCalled());
        expect(Voice.stop).toHaveBeenCalledTimes(1);
    });

    it('navigates to the next slide and starts/stops recording appropriately', async () => {
        const { getByTestId } = render(<RemoteControlScreen />);
        const nextButton = getByTestId('next-button');

        fireEvent.press(nextButton);
        expect(callFunction).toHaveBeenCalledWith(expect.any(String), { page: 2 });
        expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    });

    it('navigates to the previous slide and starts/stops recording appropriately', async () => {
        const { getByTestId } = render(<RemoteControlScreen />);
        const prevButton = getByTestId('prev-button');

        fireEvent.press(prevButton);
        expect(callFunction).toHaveBeenCalledWith(expect.any(String), { page: 1 });
        expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    });

    it('handles audio transcription and updates the slide transcription', async () => {
        const mockSpeechResults = { value: ['Test transcription'] };
        const { getByTestId } = render(<RemoteControlScreen />);

        // Trigger onSpeechResults with mock data
        await waitFor(() => Voice.onSpeechResults(mockSpeechResults));

        expect(callFunction).toHaveBeenCalledWith('addAudioTranscript', {
            courseId: 'testCourse',
            lectureId: 'testLectureId',
            pageNumber: 1,
            transcription: 'Test transcription'
        });
    });

    // it('handles errors in transcription', async () => {
    //     const mockError = { error: 'An error occurred' };
    //     const consoleSpy = jest.spyOn(console, 'log');

    //     render(<RemoteControlScreen />);
    //     await waitFor(() => Voice.onSpeechError(mockError));
    //     expect(consoleSpy).toHaveBeenCalledWith(mockError.error);
    // });
});
