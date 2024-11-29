/**
 * @file modal.test.tsx
 * @description Test suite for the modals that get plugged into 
 *              the AbstractRmtCtl component
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import LangSelectModal from '@/components/lectures/remotecontrol/modal';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';


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
