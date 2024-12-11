/**
 * @file abstractRmtCtl.test.tsx
 * @description Test suite for the AbstractRmtCtl component attached
 *              to the remote control screen
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { TranscriptModeModal } from '@/components/lectures/slides/modal';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

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


// ------------------------------------------------------------
// ------   Transcript Mode Selection  Modal Test Suite   -----
// ------------------------------------------------------------

describe('Transcript Mode Modal Test Suite', () => {
    const mockSetTransMode = jest.fn();
    const mockOnClose = jest.fn();
    const mockModalRef = { current: null };

    const renderComponent = (transMode: LectureDisplay.TranscriptLangMode) => {
        return render(
            <TranscriptModeModal
                modalRef={mockModalRef}
                transMode={transMode}
                setTransMode={mockSetTransMode}
                onClose={mockOnClose}
            />
        );
    };

    it('should render correctly', () => {
        const { getByTestId } = renderComponent('original');

        expect(getByTestId(`trans-sel-but-original`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-english`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-vietanames`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-french`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-german`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-spanish`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-italian`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-chinese`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-brazilian`)).toBeTruthy();
        expect(getByTestId(`trans-sel-but-hindi`)).toBeTruthy();
        expect(getByTestId('trans-mode-sel-close-button')).toBeTruthy();
    });

    it('should call setTransMode with the correct mode when a mode is selected', () => {
        const { getByTestId } = renderComponent('original');
        fireEvent.press(getByTestId('trans-sel-but-english'));
        expect(mockSetTransMode).toHaveBeenCalledWith('english');
    });

    it('should call onClose when the close button is pressed', () => {
        const { getByTestId } = renderComponent('original');
        fireEvent.press(getByTestId('trans-mode-sel-close-button'));
        expect(mockOnClose).toHaveBeenCalled();
    });
});