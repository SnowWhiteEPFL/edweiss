// __tests__/LectureScreen.test.tsx
import { getDownloadURL } from '@/config/firebase';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import LectureScreen from '../../../app/(app)/lectures/slides/index'; 

// Mocking dependencies
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@/hooks/firebase/firestore', () => ({
    usePrefetchedDynamicDoc: jest.fn(),
}));

jest.mock('@/hooks/useListenToMessages', () => jest.fn());
jest.mock('expo-screen-orientation', () => ({
    lockAsync: jest.fn(),
}));
jest.mock('@/config/firebase', () => ({
    getDownloadURL: jest.fn(),
}));

jest.mock('react-native-pdf', () => 'Pdf');

// Mock Data
const mockLectureDoc = {
    data: {
        pdfUri: 'sample-pdf-uri',
        audioTranscript: {
            1: 'This is a sample transcript for page 1',
        },
    },
};

describe('LectureScreen', () => {
    beforeEach(() => {
        (useLocalSearchParams as jest.Mock).mockReturnValue({
            courseNameString: 'course1',
            lectureIdString: 'lecture1',
        });

        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([mockLectureDoc]);
        (getDownloadURL as jest.Mock).mockResolvedValue('https://example.com/sample.pdf');
    });

    it('renders the loading indicator while fetching the lecture document', () => {
        (usePrefetchedDynamicDoc as jest.Mock).mockReturnValue([null]); // No document yet

        const { getByTestId } = render(<LectureScreen />);
        expect(getByTestId('loading-indicator')).toBeTruthy(); // Assuming there's an ActivityIndicator with testID
    });

    it('renders the PDF and transcript correctly after loading', async () => {
        const { getByText, getByTestId } = render(<LectureScreen />);

        await waitFor(() => expect(getDownloadURL).toHaveBeenCalledWith('sample-pdf-uri'));

        expect(getByTestId('pdf-viewer')).toBeTruthy(); // PDF component is rendered

        // Check transcript content
        expect(getByText('This is a sample transcript for page 1')).toBeTruthy();
    });

    it('handles page navigation correctly', async () => {
        const { getByTestId } = render(<LectureScreen />);

        // Initially on page 1
        await waitFor(() => expect(getByTestId('pdf-viewer')).toBeTruthy());

        // Click next page button
        fireEvent.press(getByTestId('next-page-button'));

        // Check if the page has moved forward
        expect(getByTestId('pdf-viewer').props.page).toBe(2);

        // Click previous page button
        fireEvent.press(getByTestId('prev-page-button'));

        // Check if the page moved back
        expect(getByTestId('pdf-viewer').props.page).toBe(1);
    });

    it('toggles fullscreen mode correctly', async () => {
        const { getByTestId } = render(<LectureScreen />);

        // Initially not fullscreen
        const fullscreenToggleButton = getByTestId('fullscreen-toggle-button');
        fireEvent.press(fullscreenToggleButton);

        // Check if fullscreen is enabled
        expect(fullscreenToggleButton.props.name).toBe('contract-outline'); // Icon changes to 'contract-outline'
    });
});
