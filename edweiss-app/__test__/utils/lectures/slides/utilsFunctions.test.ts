/**
 * @file utilsFunctions.test.tsx
 * @description Unit tests for utilsFunctions.tsx to ensure correct
 *              utils functionality and corner cases handling.
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { langIconMap, langNameMap } from '@/utils/lectures/remotecontrol/utilsFunctions';
import { transModeIconMap, transModeIDMap, transModeNameMap } from '@/utils/lectures/slides/utilsFunctions';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------


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
// ---------    ShowTime! Utils Functions Test suite    -------
// ------------------------------------------------------------

describe('Utils Function Testsuite', () => {
    describe('transModeIconMap', () => {
        it('should have correct icon for original mode', () => {
            expect(transModeIconMap.original).toBe("📜");
        });

        it('should have correct icons for available languages', () => {
            for (const lang in langIconMap) {
                expect(transModeIconMap[lang as keyof typeof transModeIconMap]).toBe(langIconMap[lang as keyof typeof langIconMap]);
            }
        });
    });

    describe('transModeNameMap', () => {
        it('should have correct name for original mode', () => {
            expect(transModeNameMap.original).toBe("Original");
        });

        it('should have correct names for available languages', () => {
            for (const lang in langNameMap) {
                expect(transModeNameMap[lang as keyof typeof transModeNameMap]).toBe(langNameMap[lang as keyof typeof langNameMap]);
            }
        });
    });

    describe('transModeIDMap', () => {
        it('should have correct ID for original mode', () => {
            expect(transModeIDMap.original).toBe(0);
        });

        it('should have correct IDs for available languages', () => {
            let index = 1;
            for (const lang in langNameMap) {
                expect(transModeIDMap[lang as keyof typeof transModeIDMap]).toBe(index);
                index++;
            }
        });
    });
});