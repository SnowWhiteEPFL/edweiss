import StartCourseScreen from '@/app/(app)/startCourseScreen';
import { callFunction } from '@/config/firebase';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

// Mocking expo-router functions and firebase configuration functions
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    router: {
        push: jest.fn(),
    },
}));

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

// Mocking a component that is not the focus of this test suite
jest.mock('@/components/core/header/RouteHeader', () => () => {
    return <div>Mocked RouteHeader</div>;
});

// Define mock data to use for testing
const mockCourse = JSON.stringify({
    name: "Course Test",
    started: false,
});

const mockPeriod = JSON.stringify({
    activityId: "1234",
});

// Setting up mock values for useLocalSearchParams
(useLocalSearchParams as jest.Mock).mockReturnValue({
    courseID: 'testCourseID',
    course: mockCourse,
    period: mockPeriod,
    index: 0,
});

describe('StartCourseScreen', () => {

    // Suppress console errors for cleaner test output
    beforeAll(() => {
        console.error = jest.fn();
    });

    // Restore all mocked functions to their original state after tests run
    afterAll(() => {
        jest.restoreAllMocks();
    });

    // Test that the StartCourseScreen renders with all expected buttons
    it('should render all buttons', () => {
        render(<StartCourseScreen />);

        expect(screen.getByText("Start course")).toBeTruthy();
        expect(screen.getByText("Show to student")).toBeTruthy();
        expect(screen.getByText("Go to show Time")).toBeTruthy();
        expect(screen.getByText("Go to STRC")).toBeTruthy();
        expect(screen.getByText("Send my Token")).toBeTruthy();
    });

    // Test that pressing the "Start course" button toggles it to "Stop course"
    it('should toggle course start/stop on button press', async () => {
        // Mocking the function to simulate a successful response
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });

        const { rerender } = render(<StartCourseScreen />);
        const startButton = screen.getByText("Start course");

        // Simulate button press
        await act(async () => {
            fireEvent.press(startButton);
        });

        // Rerender the component to verify the button text has changed
        rerender(<StartCourseScreen />);
        expect(screen.getByText("Stop course")).toBeTruthy();
    });

    // Test that clicking "Start course" triggers a call to start the course
    it('starts the course and shows "Stop course" after clicking "Start course"', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });
        render(<StartCourseScreen />);

        const startButton = screen.getByText("Start course").parent;
        expect(startButton).toBeTruthy();

        // Press the "Start course" button
        if (startButton) fireEvent.press(startButton);

        // Verify that "Stop course" is displayed, indicating the course has started
        await waitFor(() => expect(screen.getByText("Stop course")).toBeTruthy());

        // Check that the callFunction was called with expected parameters
        expect(callFunction).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ courseID: expect.any(String) }));
    });

    // Test that an error is logged if the function call for toggle fails
    it('displays an error if toogle_2 fails', async () => {
        // Mock the function to simulate a rejected promise with an error
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

        render(<StartCourseScreen />);
        const showButton = screen.getByText("Show to student").parent;

        // Simulate pressing the "Show to student" button
        if (showButton) {
            fireEvent.press(showButton);
        }

        // Verify that an error message is logged in the console
        await waitFor(() => expect(console.error).toHaveBeenCalledWith("Error toggling period:", expect.any(Error)));
    });

    // Test that pressing "Show to student" button updates availability when the function call succeeds
    it('updates availability when the toogle_2 function is executed successfully', async () => {
        // Mock the function to return a successful response with available data
        (callFunction as jest.Mock).mockResolvedValueOnce({
            status: 1,
            data: { available: true },
        });

        render(<StartCourseScreen />);

        const showButton = screen.getByText("Show to student").parent;

        // Simulate button press
        if (showButton) {
            fireEvent.press(showButton);

            // Verify that the screen shows "Sharing in progress..." after button press
            await waitFor(() => expect(screen.getByText("Sharing in progress...")).toBeTruthy());
        }
    });
});
