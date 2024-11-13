import StartCourseScreen from '@/app/(app)/startCourseScreen';
import { callFunction } from '@/config/firebase';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    router: {
        push: jest.fn(),
    },
}));

jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

jest.mock('@/components/core/header/RouteHeader', () => () => {
    return <div>Mocked RouteHeader</div>;
});

const mockCourse = JSON.stringify({
    name: "Course Test",
    started: false,
});

const mockPeriod = JSON.stringify({
    activityId: "1234",
});

(useLocalSearchParams as jest.Mock).mockReturnValue({
    courseID: 'testCourseID',
    course: mockCourse,
    period: mockPeriod,
    index: 0,
});

describe('StartCourseScreen', () => {

    beforeAll(() => {
        console.error = jest.fn();
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should render all buttons', () => {
        render(<StartCourseScreen />);

        expect(screen.getByText("Start course")).toBeTruthy();
        expect(screen.getByText("Show to student")).toBeTruthy();
        expect(screen.getByText("Go to show Time")).toBeTruthy();
        expect(screen.getByText("Go to STRC")).toBeTruthy();
        expect(screen.getByText("Send my Token")).toBeTruthy();
    });

    it('should toggle course start/stop on button press', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });

        const { rerender } = render(<StartCourseScreen />);
        const startButton = screen.getByText("Start course");

        await act(async () => {
            fireEvent.press(startButton);
        });

        rerender(<StartCourseScreen />);
        expect(screen.getByText("Stop course")).toBeTruthy();
    });

    it('starts the course and shows "Stop course" after clicking "Start course"', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({ status: 1 });
        render(<StartCourseScreen />);
        const startButton = screen.getByText("Start course").parent;
        expect(startButton).toBeTruthy();
        if (startButton) fireEvent.press(startButton);

        await waitFor(() => expect(screen.getByText("Stop course")).toBeTruthy());
        expect(callFunction).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ courseID: expect.any(String) }));
    });

    it('displays an error if toogle_2 fails', async () => {
        (callFunction as jest.Mock).mockRejectedValueOnce(new Error("Test error"));
        render(<StartCourseScreen />);
        const showButton = screen.getByText("Show to student").parent;
        if (showButton) {
            fireEvent.press(showButton);
        }
        await waitFor(() => expect(console.error).toHaveBeenCalledWith("Error toggling period:", expect.any(Error)));
    });

    it('updates availability when the toogle_2 function is executed successfully', async () => {
        (callFunction as jest.Mock).mockResolvedValueOnce({
            status: 1,
            data: { available: true },
        });

        render(<StartCourseScreen />);

        const showButton = screen.getByText("Show to student").parent;

        if (showButton) {
            fireEvent.press(showButton);
            await waitFor(() => expect(screen.getByText("Sharing in progress...")).toBeTruthy());
        }
    });
});
