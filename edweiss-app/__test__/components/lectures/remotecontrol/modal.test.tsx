/**
 * @file modal.test.tsx
 * @description Test suite for the modals that get plugged into 
 *              the AbstractRmtCtl component
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { LangSelectModal, QuestionBroadcastModal, TimerSettingModal } from '@/components/lectures/remotecontrol/modal';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Toast from 'react-native-toast-message';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Global constants
const availableLangs: LectureDisplay.AvailableLangs[] = [
    'english', 'french', 'german', 'spanish', 'italian', 'brazilian', 'arabic', 'chinese', 'vietanames', 'hindi'
];


// Mock the setLang and onClose lambda
const mockSetLang = jest.fn();
const mockOnClose = jest.fn();


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

// BottomSheet to detect modal appearance
jest.mock('@gorhom/bottom-sheet', () => ({
    BottomSheetModal: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    BottomSheetView: jest.fn(({ children }) => (
        <div>{children}</div>
    )),
    BottomSheetBackdrop: jest.fn(),
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


// ------------------------------------------------------------
// -------------     LangSelectModal Tests suites     ---------
// ------------------------------------------------------------

describe('LangSelectModal', () => {
    it('renders all language buttons', () => {
        const modalRef = React.createRef<BottomSheetModal>();
        const { getByTestId } = render(
            <LangSelectModal
                modalRef={modalRef}
                lang="english"
                setLang={mockSetLang}
                onClose={mockOnClose}
            />
        );


        expect(getByTestId('lang-sel-close-button'));
        availableLangs.forEach(lang => {
            expect(getByTestId(`lang-but-${lang}`)).toBeTruthy();
        });

    });

    it('verify that french can be selected when english is default', () => {
        const modalRef = React.createRef<BottomSheetModal>();
        const { getByTestId } = render(
            <LangSelectModal
                modalRef={modalRef}
                lang="english"
                setLang={mockSetLang}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByTestId('lang-but-french'));
        expect(mockSetLang).toHaveBeenCalledWith('french');
    });

    it('verify that english can be selected when french is default', () => {
        const modalRef = React.createRef<BottomSheetModal>();
        const { getByTestId } = render(
            <LangSelectModal
                modalRef={modalRef}
                lang="french"
                setLang={mockSetLang}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByTestId('lang-but-english'));
        expect(mockSetLang).toHaveBeenCalledWith('english');
    });

    it('calls onClose when the close button is pressed', () => {
        const modalRef = React.createRef<BottomSheetModal>();
        const { getByTestId } = render(
            <LangSelectModal
                modalRef={modalRef}
                lang="english"
                setLang={mockSetLang}
                onClose={mockOnClose}
            />
        );

        fireEvent.press(getByTestId('lang-sel-close-button'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});


// Mock Toast message
jest.mock('react-native-toast-message', () => ({
    show: jest.fn(),
}));



// ------------------------------------------------------------
// ----------      Timer Settig Modal Tests suites      -------
// ------------------------------------------------------------

describe('TimerSettingModal', () => {
    const mockModalRef = { current: null };
    const mockSetTimer = jest.fn();
    const mockSetRecall = jest.fn();
    const mockSetIsCritical = jest.fn();
    const mockOnClose = jest.fn();

    const renderModal = (props = {}) =>
        render(
            <TimerSettingModal
                modalRef={mockModalRef}
                currentTimer={300}
                currentRecall={200}
                setTimer={mockSetTimer}
                setRecall={mockSetRecall}
                setIsCritical={mockSetIsCritical}
                onClose={mockOnClose}
                {...props}
            />
        );

    const renderModalSetToZero = (props = {}) =>
        render(
            <TimerSettingModal
                modalRef={mockModalRef}
                currentTimer={0}
                currentRecall={0}
                setTimer={mockSetTimer}
                setRecall={mockSetRecall}
                setIsCritical={mockSetIsCritical}
                onClose={mockOnClose}
                {...props}
            />
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByTestId } = renderModal();
        expect(getByTestId('hours-timer')).toBeTruthy();
        expect(getByTestId('minutes-timer')).toBeTruthy();
        expect(getByTestId('seconds-timer')).toBeTruthy();
        expect(getByTestId('hours-recall')).toBeTruthy();
        expect(getByTestId('minutes-recall')).toBeTruthy();
        expect(getByTestId('seconds-recall')).toBeTruthy();
        expect(getByTestId('dec-timer-button')).toBeTruthy();
        expect(getByTestId('add-timer-button')).toBeTruthy();
        expect(getByTestId('set-it-up-button')).toBeTruthy();
        expect(getByTestId('timer-set-close-button')).toBeTruthy();
        expect(getByTestId('set-timer-modal-title')).toBeTruthy();
    });

    test('increments timer correctly', () => {
        const { getByTestId } = renderModal();
        const addButton = getByTestId('add-timer-button');
        fireEvent.press(addButton);
        expect(mockSetTimer).not.toHaveBeenCalled(); // Temp state, not committed
    });

    test('decrements timer correctly', () => {
        const { getByTestId } = renderModal();
        const decButton = getByTestId('dec-timer-button');
        fireEvent.press(decButton);
        expect(mockSetTimer).not.toHaveBeenCalled(); // Temp state, not committed
    });

    test('updates hours timer when buttons are pressed', () => {
        const { getByTestId, getByText } = renderModal();
        fireEvent.press(getByTestId('hours-timer'));
        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('1')).toBeTruthy();

        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('2')).toBeTruthy();

        fireEvent.press(getByTestId('dec-timer-button'));
        expect(getByText('1')).toBeTruthy();

    });


    test('updates hours recall when buttons are pressed', () => {
        const { getByTestId, getByText } = renderModalSetToZero();
        fireEvent.press(getByTestId('hours-recall'));
        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('1')).toBeTruthy();

        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('2')).toBeTruthy();

        fireEvent.press(getByTestId('dec-timer-button'));
        expect(getByText('1')).toBeTruthy();
    });

    test('updates minutes timer when buttons are pressed', () => {
        const { getByTestId, getByText } = renderModalSetToZero();
        fireEvent.press(getByTestId('minutes-timer'));
        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('01')).toBeTruthy();

        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('02')).toBeTruthy();

        fireEvent.press(getByTestId('dec-timer-button'));
        expect(getByText('01')).toBeTruthy();

    });


    test('updates minutes recall when buttons are pressed', () => {
        const { getByTestId, getByText } = renderModalSetToZero();
        fireEvent.press(getByTestId('minutes-recall'));
        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('01')).toBeTruthy();

        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('02')).toBeTruthy();

        fireEvent.press(getByTestId('dec-timer-button'));
        expect(getByText('01')).toBeTruthy();

    });

    test('updates seconds timer when buttons are pressed', () => {
        const { getByTestId, getByText } = renderModalSetToZero();
        fireEvent.press(getByTestId('seconds-timer'));
        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('01')).toBeTruthy();

        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('02')).toBeTruthy();

        fireEvent.press(getByTestId('dec-timer-button'));
        expect(getByText('01')).toBeTruthy();

    });

    test('updates seconds recall when buttons are pressed', () => {
        const { getByTestId, getByText } = renderModalSetToZero();
        fireEvent.press(getByTestId('seconds-recall'));
        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('01')).toBeTruthy();

        fireEvent.press(getByTestId('add-timer-button'));
        expect(getByText('02')).toBeTruthy();

        fireEvent.press(getByTestId('dec-timer-button'));
        expect(getByText('01')).toBeTruthy();

    });

    test('sets timer and recall correctly on confirmation', () => {
        const { getByTestId } = renderModal();
        const setItUpButton = getByTestId('set-it-up-button');
        fireEvent.press(setItUpButton);
        expect(mockSetTimer).toHaveBeenCalledWith(300);
        expect(mockSetRecall).toHaveBeenCalledWith(200);
        expect(mockSetIsCritical).toHaveBeenCalledWith(false);
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('shows error toast if recall is greater than timer', () => {


        const { getByTestId } = renderModal({ currentTimer: 100, currentRecall: 200 });
        const setItUpButton = getByTestId('set-it-up-button');
        fireEvent.press(setItUpButton);

        expect(Toast.show).toHaveBeenCalled();
    });

    test('closes modal on close button press', () => {
        const { getByTestId } = renderModal();
        const closeButton = getByTestId('timer-set-close-button');
        fireEvent.press(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('does not allow timer to go below 0 or above 35999', () => {
        const { getByTestId } = renderModal({ currentTimer: 0 });
        const decButton = getByTestId('dec-timer-button');
        fireEvent.press(decButton);
        expect(mockSetTimer).not.toHaveBeenCalled();

        const { getByTestId: getByTestIdMax } = renderModal({ currentTimer: 35999 });
        const addButton = getByTestIdMax('add-timer-button');
        fireEvent.press(addButton);
        expect(mockSetTimer).not.toHaveBeenCalled();
    });
});


// ------------------------------------------------------------
// -----      Question Broadcast Modal Test Suites       ------
// ------------------------------------------------------------

describe('QuestionBroadcastModal', () => {
    const mockModalRef = { current: null };
    const mockSetBroadcasted = jest.fn();
    const mockOnClose = jest.fn();

    const renderModal = (props = {}) =>
        render(
            <QuestionBroadcastModal
                modalRef={mockModalRef}
                id="1"
                courseId="course1"
                lectureId="lecture1"
                question="Sample question?"
                username="John Doe"
                likes={5}
                broadcasted=""
                setBroadcasted={mockSetBroadcasted}
                onClose={mockOnClose}
                {...props}
            />
        );

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly', () => {
        const { getByTestId, getByText } = renderModal();
        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('5')).toBeTruthy();
        expect(getByTestId('brod-quest-ans-button')).toBeTruthy();
        expect(getByTestId('brod-quest-close-button')).toBeTruthy();
    });

    test('calls handleQuestionBroadcast when broadcast button is pressed', () => {
        const { getByTestId } = renderModal();
        const broadcastButton = getByTestId('brod-quest-ans-button');
        fireEvent.press(broadcastButton);
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockSetBroadcasted).toHaveBeenCalledWith("1");
    });

    test('calls handleQuestionBroadcast when broadcast button is pressed again to mark as answered', () => {
        const { getByTestId } = renderModal({ broadcasted: "1" });
        const broadcastButton = getByTestId('brod-quest-ans-button');
        fireEvent.press(broadcastButton);
        expect(mockOnClose).toHaveBeenCalled();
        expect(mockSetBroadcasted).toHaveBeenCalledWith("");
    });

    test('calls onClose when the close button is pressed', () => {
        const { getByTestId } = renderModal();
        const closeButton = getByTestId('brod-quest-close-button');
        fireEvent.press(closeButton);
        expect(mockOnClose).toHaveBeenCalled();
    });
});

