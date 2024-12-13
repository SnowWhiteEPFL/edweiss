import SVGImage from '@/components/core/SVGImage';
import { render, waitFor } from '@testing-library/react-native';
import axios from 'axios';
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

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SVGImage Component', () => {
    it('renders a loading spinner while fetching SVG', async () => {
        mockedAxios.get.mockImplementationOnce(() => new Promise(() => { })); // Simule une requête en cours

        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} />
        );

        await waitFor(() => screen.getByTestId('activityIndicatorId'));
    });

    it('renders an error message when fetching fails', async () => {

        mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} />
        );

        await waitFor(() => screen.getByTestId('errorText'));
        screen.getByText('An error occurred');
    });

    it('renders the SVG when fetching succeeds', async () => {
        const svgContent = '<svg><circle cx="50" cy="50" r="40" /></svg>';
        mockedAxios.get.mockResolvedValueOnce({ data: svgContent });

        const screen = render(
            <SVGImage uri="mocked-uri" width={100} height={100} />
        );

        (await waitFor(() => expect(screen.getByTestId('svg-mock')))).toBeTruthy();
    });

    it('calls onError when the SVG rendering fails', async () => {
        const onErrorMock = jest.fn();
        mockedAxios.get.mockResolvedValueOnce({ data: '<invalid-svg>' });

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