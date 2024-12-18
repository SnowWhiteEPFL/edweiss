/**
 * @file index.test.tsx
 * @description Test suite for /login/index screen and LoadingPageComponent
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Login from '@/app/login';
import { LoadingPageCompoment } from '@/components/InitialLoadingScreen';
import { callFunction, signInAnonymously, signInWithGoogle } from '@/config/firebase';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Use auth for the current user
jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn(() => ({ isAuthenticated: false })),
}));

// Sign in fucntions
jest.mock('@/config/firebase', () => ({
    signInWithGoogle: jest.fn(),
    signInAnonymously: jest.fn(),
    callFunction: jest.fn(),
}));

// Expo router with stack screen to test up buttons and title
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    router: {
        push: jest.fn(),
        back: jest.fn(),
        replace: jest.fn(),
    },
    Stack: {
        Screen: jest.fn(({ options }) => (
            <>{options.title}</>
        )),
    },
}));


// Application Route
jest.mock('@/constants/Component', () => ({
    ApplicationRoute: jest.fn(),
}));


// `t` to return the key as the translation
jest.mock('@/config/i18config', () => ({
    __esModule: true,
    default: jest.fn((key: string) => key),
}));


// ------------------------------------------------------------
// ----------------    Login Screen Test suite   --------------
// ------------------------------------------------------------

describe('Login Screen Tests Suites', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly and all the component on the Login screen', () => {
        const { getByText, getByTestId } = render(<Login />);
        expect(getByTestId('mountain_logo_png')).toBeTruthy();
        expect(getByText('login:welcome_title')).toBeTruthy();
        expect(getByTestId('quote-text-output')).toBeTruthy();
        expect(getByTestId('quote-but-1')).toBeTruthy();
        expect(getByTestId('quote-but-2')).toBeTruthy();
        expect(getByTestId('quote-but-3')).toBeTruthy();
        expect(getByTestId('google-but')).toBeTruthy();
        expect(getByTestId('anon-but')).toBeTruthy();
    });

    it('calls signInWithGoogle and navigates if successful', async () => {
        (signInWithGoogle as jest.Mock).mockResolvedValue({
            user: { displayName: 'Test User' },
        });
        (callFunction as jest.Mock).mockResolvedValue({ status: 1 });

        const { getByTestId } = render(<Login />);
        const googleButton = getByTestId('google-but');
        fireEvent.press(googleButton);
        expect(signInWithGoogle).toHaveBeenCalled();
        await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    });

    it('shows an error if Google sign-in fails during account creation', async () => {
        (signInWithGoogle as jest.Mock).mockResolvedValue({
            user: { displayName: 'Test User' },
        });
        (callFunction as jest.Mock).mockResolvedValue({ status: 0, error: 'Error creating account' });

        const { getByTestId } = render(<Login />);
        const googleButton = getByTestId('google-but');

        fireEvent.press(googleButton);
        await waitFor(() => expect(callFunction).toHaveBeenCalled());

        expect(router.replace).not.toHaveBeenCalled();
    });

    it('do not call the cloud function on undefined signinGoogle', async () => {
        (signInWithGoogle as jest.Mock).mockResolvedValue({
            user: { displayName: 'Test User' },
        });
        (callFunction as jest.Mock).mockResolvedValue({ status: 0, error: 'Error creating account' });
        (signInWithGoogle as jest.Mock).mockResolvedValue(undefined);


        const { getByTestId } = render(<Login />);
        const googleButton = getByTestId('google-but');

        fireEvent.press(googleButton);
        await waitFor(() => expect(callFunction).not.toHaveBeenCalled());
    });

    it('calls signInAnonymously and navigates if successful', async () => {
        (signInAnonymously as jest.Mock).mockResolvedValue({
            user: { displayName: 'Anonymous' },
        });
        (callFunction as jest.Mock).mockResolvedValue({ status: 1 });

        const { getByTestId } = render(<Login />);
        const anonButton = getByTestId('anon-but');

        fireEvent.press(anonButton);
        expect(signInAnonymously).toHaveBeenCalled();

        await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/'));
    });

    it('shows an error if anonymous sign-in fails during account creation', async () => {
        (signInAnonymously as jest.Mock).mockResolvedValue({
            user: { displayName: 'Anonymous' },
        });
        (callFunction as jest.Mock).mockResolvedValue({ status: 0, error: 'Error creating account' });

        const { getByTestId } = render(<Login />);
        const anonButton = getByTestId('anon-but');

        fireEvent.press(anonButton);
        await waitFor(() => expect(callFunction).toHaveBeenCalled());

        expect(router.replace).not.toHaveBeenCalled();
    });

    it('do not call the cloud function on undefined signinAnonymous', async () => {
        (signInWithGoogle as jest.Mock).mockResolvedValue({
            user: { displayName: 'Test User' },
        });
        (callFunction as jest.Mock).mockResolvedValue({ status: 0, error: 'Error creating account' });
        (signInAnonymously as jest.Mock).mockResolvedValue(undefined);


        const { getByTestId } = render(<Login />);
        const googleButton = getByTestId('google-but');

        fireEvent.press(googleButton);
        await waitFor(() => expect(callFunction).not.toHaveBeenCalled());
    });

});


// ------------------------------------------------------------
// ----------------    Loading Screen Test suite   --------------
// ------------------------------------------------------------

describe('LoadingPageComponent Tests suites', () => {
    it('renders the loading screen with an image and loading indicator', () => {
        const { getByTestId } = render(<LoadingPageCompoment />);
        expect(getByTestId('load-indicator')).toBeTruthy();
    });
});
