import Login, { LoadingPageCompoment } from '@/app/login';
import { callFunction, signInAnonymously, signInWithGoogle } from '@/config/firebase';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import React from 'react';

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

describe('Login Screen', () => {
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

    it('displays three quote buttons and allows selection of a quote', () => {
        const { getByTestId } = render(<Login />);

        const quoteButton1 = getByTestId('quote-but-1');
        const quoteButton2 = getByTestId('quote-but-2');
        const quoteButton3 = getByTestId('quote-but-3');

        expect(quoteButton1.props.style.backgroundColor).toBe("#04a5e5"); // Selected color for quote 1
        expect(quoteButton2.props.style.backgroundColor).toBe("#ccd0da");
        expect(quoteButton3.props.style.backgroundColor).toBe("#ccd0da");

        fireEvent.press(quoteButton2);
        expect(quoteButton1.props.style.backgroundColor).toBe("#ccd0da");
        expect(quoteButton2.props.style.backgroundColor).toBe("#04a5e5"); // Selected color for quote 2
        expect(quoteButton3.props.style.backgroundColor).toBe("#ccd0da");

        fireEvent.press(quoteButton3);
        expect(quoteButton1.props.style.backgroundColor).toBe("#ccd0da");
        expect(quoteButton2.props.style.backgroundColor).toBe("#ccd0da");
        expect(quoteButton3.props.style.backgroundColor).toBe("#04a5e5"); // Selected color for quote 3

        fireEvent.press(quoteButton1);
        expect(quoteButton1.props.style.backgroundColor).toBe("#04a5e5"); // Selected color for quote 1
        expect(quoteButton2.props.style.backgroundColor).toBe("#ccd0da");
        expect(quoteButton3.props.style.backgroundColor).toBe("#ccd0da");

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


describe('LoadingPageComponent', () => {
    it('renders the loading screen with an image and loading indicator', () => {
        const { getByText, getByTestId } = render(<LoadingPageCompoment />);
        expect(getByTestId('flower_logo_png')).toBeTruthy();
        expect(getByTestId('load-indicator')).toBeTruthy();
        expect(getByText('login:by_snowwhite_team')).toBeTruthy();
    });
});
