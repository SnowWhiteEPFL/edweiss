/**
 * @file abstractRmtCtl.test.tsx
 * @description Test suite for the AbstractRmtCtl component attached 
 *              to the remote control screen
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { AbstractRmtCrl } from '@/components/lectures/remotecontrol/abstractRmtCtl';
import t from '@/config/i18config';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { langIconMap } from '@/utils/lectures/remotecontrol/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';
import { Vibration } from 'react-native';
import Toast from 'react-native-toast-message';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Constants
const curPageProvided = 3;
const totPageProvided = 5;
const courseNameString = "super-cool-course";
const lectureIdString = "super-interessting-lecture-id";


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

// Authentication mock
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(),
}));

// Sign in fucntions
jest.mock('@/config/firebase', () => ({
    signInWithGoogle: jest.fn(),
    signInAnonymously: jest.fn(),
    callFunction: jest.fn(),
}));


// Firebase modules
jest.mock('@react-native-firebase/auth', () => ({
    currentUser: { uid: 'anonymous' },
    signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'anonymous' } })),
}));


// BottomSheet to detect modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ present }) => (
        <div>{present}</div>
    )),
}));


// Firebase functions
jest.mock('@react-native-firebase/functions', () => {
    return {
        httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: { status: true } })))
    };
});

// Storage module
jest.mock('@react-native-firebase/storage', () => {
    return {
        ref: jest.fn(() => ({
            putFile: jest.fn(() => Promise.resolve({})),
            getDownloadURL: jest.fn(() => Promise.resolve('mocked_download_url')),
            delete: jest.fn(() => Promise.resolve({}))
        })),
    };
});


// Firestore communication with database
jest.mock('@react-native-firebase/firestore', () => ({
    __esModule: true,
    default: jest.fn(() => Promise.resolve({})),
}));



// useDynamicDocs hooks
jest.mock('@/hooks/firebase/firestore', () => ({
    useDynamicDocs: jest.fn(() => [
        { id: '1', data: () => ({ name: 'Sample Todo', status: 'yet' }) }
    ])
}));


// Toast message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));





// ------------------------------------------------------------
// ---------     Abstract Remote Control Test Suite     -------
// ------------------------------------------------------------

describe('AbstractRmtCrl Component', () => {
    const handleRightMock = jest.fn();
    const handleLeftMock = jest.fn();
    const handleMicMock = jest.fn();
    const langMock: LectureDisplay.AvailableLangs = 'english';
    const setLangMock = jest.fn();

    let modalRef: React.RefObject<BottomSheetModal>;

    beforeEach(() => {
        modalRef = {
            current: {
                present: jest.fn(),
                dismiss: jest.fn(),
                snapToIndex: jest.fn(),
                snapToPosition: jest.fn(),
                expand: jest.fn(),
                collapse: jest.fn(),
                close: jest.fn(),
                forceClose: jest.fn(),
            }
        };

        jest.clearAllMocks(); // Reset mocks before each test
    });

    test('renders the disabled RouteHeader with correct title', () => {
        const { getByTestId } = render(<AbstractRmtCrl
            handleRight={handleRightMock}
            handleLeft={handleLeftMock}
            handleMic={handleMicMock}
            isRecording={false}
            lang={langMock}
            setLang={setLangMock}
            curPageProvided={curPageProvided}
            totPageProvided={totPageProvided}
            courseNameString={courseNameString}
            lectureIdString={lectureIdString}
        />)

        expect(getByTestId("title")).toBeTruthy();
    });

    test('renders titles correctly', () => {
        const { getByText } = render(<AbstractRmtCrl
            handleRight={handleRightMock}
            handleLeft={handleLeftMock}
            handleMic={handleMicMock}
            isRecording={false}
            lang={langMock}
            setLang={setLangMock}
            curPageProvided={curPageProvided}
            totPageProvided={totPageProvided}
            courseNameString={courseNameString}
            lectureIdString={lectureIdString}
        />)

        expect(getByText(t('showtime:showtime_title'))).toBeTruthy();
    });

    test('renders buttons', () => {
        const { getByTestId } = render(<AbstractRmtCrl
            handleRight={handleRightMock}
            handleLeft={handleLeftMock}
            handleMic={handleMicMock}
            isRecording={false}
            lang={langMock}
            setLang={setLangMock}
            curPageProvided={curPageProvided}
            totPageProvided={totPageProvided}
            courseNameString={courseNameString}
            lectureIdString={lectureIdString}
        />)

        expect(getByTestId('strc-lang-button')).toBeTruthy();
        expect(getByTestId('timer-but')).toBeTruthy();

        expect(getByTestId('prev-button')).toBeTruthy();
        expect(getByTestId('next-button')).toBeTruthy();
        expect(getByTestId('mic-button')).toBeTruthy();

        expect(getByTestId('strc-go-to-button')).toBeTruthy();
        expect(getByTestId('strc-activity-button')).toBeTruthy();
        expect(getByTestId('strc-chat-button')).toBeTruthy();

    });



    test('displays start recording message when not recording', () => {
        const { getByText } = render(
            <AbstractRmtCrl
                handleRight={jest.fn()}
                handleLeft={jest.fn()}
                handleMic={jest.fn()}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

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
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

            />
        );

        const fullString = langIconMap[langMock] + " " + t(`showtime:recording_start`);
        const startRecordingText = getByText(fullString);
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
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

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
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

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
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

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
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

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
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

            />
        );

        fireEvent.press(getByTestId('mic-button'));
        expect(handleMicMock).toHaveBeenCalled();
    });



    test('go to JumpToPage screen when Go to Page button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

            />
        );

        fireEvent.press(getByTestId('strc-go-to-button'));
        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/lectures/remotecontrol/jumpToSlide',
            params: {
                courseNameString,
                lectureIdString,
                currentPageString: curPageProvided.toString(),
                totalPageString: totPageProvided.toString(),
            },
        });
    });

    test('shows toast when Available activities button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

            />
        );

        fireEvent.press(getByTestId('strc-activity-button'));
        expect(Toast.show).toHaveBeenCalledWith({
            type: 'success',
            text1: 'The Available activities',
            text2: 'Implementation comes soon'
        });
    });

    test('go to audience live question manager when it button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

            />
        );

        fireEvent.press(getByTestId('strc-chat-button'));
        expect(router.push).toHaveBeenCalledWith({
            pathname: '/(app)/lectures/remotecontrol/questionToSlide',
            params: {
                courseNameString,
                lectureIdString,
                currentPageString: curPageProvided.toString(),
                totalPageString: totPageProvided.toString(),
            },
        });
    });

    test('displays the timer correctly', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}

            />
        );

        const timerText = getByTestId('timer-txt');
        expect(timerText).toBeTruthy();
        expect(timerText.props.children).toBe('0:00:00');
    });

    test('do not close the language selection modal when language button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}
            />
        );

        fireEvent.press(getByTestId('strc-lang-button'));
        expect(modalRef.current?.close).not.toHaveBeenCalled();
    });

    test('do not close the timer selection modal when language button is pressed', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}
            />
        );

        fireEvent(getByTestId('timer-but'), 'longPress');
        expect(modalRef.current?.close).not.toHaveBeenCalled();
    });

    test('stop watch stop at 0:00:00 ', () => {
        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}
            />
        );

        fireEvent.press(getByTestId('timer-but'));
        const timerText = getByTestId('timer-txt');
        expect(timerText.props.children).toBe('0:00:00');
    });

    test('starts and stops the timer correctly', () => {
        jest.useFakeTimers();
        jest.mock('react-native', () => {
            const actualReactNative = jest.requireActual('react-native');
            return {
                ...actualReactNative,
                Vibration: {
                    vibrate: jest.fn(),
                },
            };
        });

        const { getByTestId } = render(
            <AbstractRmtCrl
                handleRight={handleRightMock}
                handleLeft={handleLeftMock}
                handleMic={handleMicMock}
                isRecording={false}
                lang={langMock}
                setLang={setLangMock}
                curPageProvided={curPageProvided}
                totPageProvided={totPageProvided}
                courseNameString={courseNameString}
                lectureIdString={lectureIdString}
            />
        );

        const timerButton = getByTestId('timer-but');
        fireEvent.press(timerButton);
        expect(Vibration.vibrate).toHaveBeenCalledWith([50, 300, 50, 300, 50, 300]);
    });
});
