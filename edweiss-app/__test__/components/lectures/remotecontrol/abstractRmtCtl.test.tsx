import { AbstractRmtCrl } from '@/components/lectures/remotecontrol/abstractRmtCtl';
import t from '@/config/i18config';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

// Mock translation function
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key) => key),
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
                </>
            )),
        },
    };
});


describe('AbstractRmtCrl Component', () => {
    const handleRightMock = jest.fn();
    const handleLeftMock = jest.fn();
    const handleMicMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });


    test('renders the disabled RouteHeader with correct title', () => {
        const { getByTestId } = render(<AbstractRmtCrl
            handleRight={handleRightMock}
            handleLeft={handleLeftMock}
            handleMic={handleMicMock}
            isRecording={false}
        />)

        expect(getByTestId("title")).toBeTruthy();
    });

    test('renders titles correctly', () => {
        const { getByText } = render(<AbstractRmtCrl
            handleRight={handleRightMock}
            handleLeft={handleLeftMock}
            handleMic={handleMicMock}
            isRecording={false}
        />)

        expect(getByText(t('showtime:showtime_title'))).toBeTruthy();
        expect(getByText(t('showtime:rmt_cntl_title'))).toBeTruthy();
    });

    test('renders buttons', () => {
        const { getByTestId } = render(<AbstractRmtCrl
            handleRight={handleRightMock}
            handleLeft={handleLeftMock}
            handleMic={handleMicMock}
            isRecording={false}
        />)

        expect(getByTestId('prev-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
        expect(getByTestId('mic-button')).toBeTruthy();
    });



    test('displays start recording message when not recording', () => {
        const { getByText } = render(
            <AbstractRmtCrl
                handleRight={jest.fn()}
                handleLeft={jest.fn()}
                handleMic={jest.fn()}
                isRecording={false}
            />
        );

        const startRecordingText = getByText(t('showtime:tap_to_start_recording'));
        expect(startRecordingText).toBeTruthy();
        const styles = startRecordingText.props.style;
        const colorStyle = Array.isArray(styles) ? styles.find(style => style.color) : styles;
        expect(colorStyle.color).toBe("#40a02b");
    });

    test('displays recording message when recording', () => {
        const { getByText } = render(
            <AbstractRmtCrl
                handleRight={jest.fn()}
                handleLeft={jest.fn()}
                handleMic={jest.fn()}
                isRecording={true}
            />
        );

        const startRecordingText = getByText(t('showtime:recording_start'));
        expect(startRecordingText).toBeTruthy();
        const styles = startRecordingText.props.style;
        const colorStyle = Array.isArray(styles) ? styles.find(style => style.color) : styles;
        expect(colorStyle.color).toBe("#d20f39");
    });


    test('changes mic button color when recording', () => {
        const { rerender, getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
            />
        );

        let micButton = getByTestId('mic-button');
        expect(micButton).toBeTruthy();
        let micButtonStyles = micButton.props.style;
        let backgroundColorStyle = Array.isArray(micButtonStyles) ? micButtonStyles.find(style => style.backgroundColor) : micButtonStyles;
        expect(backgroundColorStyle.backgroundColor).toBe("#eff1f5");
        let borderColorStyle = Array.isArray(micButtonStyles) ? micButtonStyles.find(style => style.borderColor) : micButtonStyles;
        expect(borderColorStyle.borderColor).toBe("#d20f39");

        rerender(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={true}
            />
        );

        micButton = getByTestId('mic-button');
        expect(micButton).toBeTruthy();
        micButtonStyles = micButton.props.style;
        backgroundColorStyle = Array.isArray(micButtonStyles) ? micButtonStyles.find(style => style.backgroundColor) : micButtonStyles;
        expect(backgroundColorStyle.backgroundColor).toBe("#d20f39");
        borderColorStyle = Array.isArray(micButtonStyles) ? micButtonStyles.find(style => style.borderColor) : micButtonStyles;
        expect(borderColorStyle.borderColor).toBe("#eff1f5");
    });

    test('calls handleLeft when previous button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
            />
        );

        fireEvent.press(getByTestId('prev-button'));
        expect(handleLeftMock).toHaveBeenCalled();
    });

    test('calls handleRight when next button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
            />
        );

        fireEvent.press(getByTestId('next-button'));
        expect(handleRightMock).toHaveBeenCalled();
    });

    test('calls handleMic when mic button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
            />
        );

        fireEvent.press(getByTestId('mic-button'));
        expect(handleMicMock).toHaveBeenCalled();
    });


});
