import SVGImage from '@/components/core/SVGImage';
import { render, waitFor } from '@testing-library/react-native';
import { TextProps } from 'react-native';

jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

jest.mock('@/components/core/TActivityIndicator', () => {
    return {
        __esModule: true,  // Ceci est nécessaire pour simuler un module ES6
        default: jest.fn(() => null), // On retourne une version mockée de TActivityIndicator qui ne rend rien
    };
});

jest.mock('react-native-svg', () => {
    const React = require('react');
    return {
        SvgXml: ({ xml, ...props }: { xml: string;[key: string]: any }) => {
            console.log('SvgXml mock called with:', xml);
            return React.createElement('SvgMock', { ...props, testID: 'svg-mock' });
        },
    };
});

// Mock t() function
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'common:errorOccurred') return 'An error occurred';
        else return str;
    })
);

describe('SVGImage Component', () => {

    beforeEach(() => {
        (global.fetch as jest.Mock) = jest.fn(() =>
            Promise.resolve({
                ok: true,
                text: () => Promise.resolve('<svg><circle cx="50" cy="50" r="40" /></svg>'), // Données simulées
            } as unknown as Response)
        );
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders a loading spinner while fetching SVG', async () => {

        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} />
        );

        await waitFor(() => screen.getByTestId('activityIndicatorId'));
    });

    it('renders an error message when fetching fails', async () => {

        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));
        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} />
        );

        await waitFor(() => screen.getByTestId('errorText'));
        screen.getByText('An error occurred');
    });

    it('renders the SVG when fetching succeeds', async () => {
        const svgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>';

        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} />
        );

        (await waitFor(() => expect(screen.getByTestId('svg-mock')))).toBeTruthy();
    });

    it('calls onError when the SVG rendering fails', async () => {
        const onErrorMock = jest.fn();

        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} onError={onErrorMock} />
        );

        const svgMock = await waitFor(() => screen.getByTestId('svg-mock'));
        expect(svgMock.props.onError).toBe(onErrorMock);

        // Simule une erreur
        svgMock.props.onError();
        expect(onErrorMock).toHaveBeenCalledTimes(1); // Vérifie que l'erreur est appelée
    });
});