import DocumentScreen, { testIDs } from '@/app/(app)/courses/[id]/materials/[materialId]';
import { getDownloadURL } from '@/config/firebase';
import { useRouteParameters } from '@/hooks/routeParameters';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as FileSystem from 'expo-file-system';
import { TextProps, TouchableOpacityProps, ViewProps } from 'react-native';
import { PdfProps } from 'react-native-pdf';

jest.mock('@/components/core/containers/TView.tsx', () => {
    const { View } = require('react-native');
    return (props: ViewProps) => <View {...props} />;
});

jest.mock('@/components/core/TText.tsx', () => {
    const { Text } = require('react-native');
    return (props: TextProps) => <Text {...props} />;
});

jest.mock('@/components/core/containers/TTouchableOpacity.tsx', () => {
    const { TouchableOpacity, View } = require('react-native');
    return (props: React.PropsWithChildren<TouchableOpacityProps>) => (
        <TouchableOpacity {...props}>
            <View>{props.children}</View>
        </TouchableOpacity>
    );
});

jest.mock('@/components/core/Icon', () => {
    return {
        __esModule: true,
        default: ({ name, size = 16, color = 'subtext0', testID }: { name: string; size?: number; color?: string; testID?: string }) => {
            const { Text } = require('react-native');
            return <Text testID={testID || 'icon'}>{`Icon - ${name} - Size: ${size} - Color: ${color}`}</Text>;
        }
    };
});

// Mock t() function
jest.mock('@/config/i18config', () =>
    jest.fn((str: string) => {
        if (str === 'course:document_error') return 'An error occurred while loading the document.';
        else if (str === 'course:document_not_supported') return 'This document format cannot be displayed by Edweiss. \n You can download the document to view it.';
        else if (str === 'common:of') return ' of ';
        else return str;
    })
);

jest.mock('@/components/core/header/RouteHeader', () => {
    const { View, Text } = require('react-native');
    return ({ title, right }: { title: string, right: React.ReactNode | undefined }) => <View><Text>{title}</Text>{right}</View>;
});

jest.mock('@/hooks/routeParameters', () => ({
    useRouteParameters: jest.fn(),
}));

jest.mock('@/components/core/TActivityIndicator', () => {
    return {
        __esModule: true,  // Ceci est nécessaire pour simuler un module ES6
        default: jest.fn(() => null), // On retourne une version mockée de TActivityIndicator qui ne rend rien
    };
});

// Mock SVGImage component
jest.mock('@/components/core/SVGImage', () => {
    const { View } = require('react-native');
    return {
        __esModule: true,
        default: (props: { testID?: string }) => <View testID={props.testID} />,
    };
});

// Mock Image component
jest.mock('react-native', () => {
    const React = require('react');
    const RN = jest.requireActual('react-native');

    return {
        ...RN,
        NativeEventEmitter: jest.fn(),
        Image: (props: React.ComponentProps<typeof RN.Image>) => {
            return React.createElement('Image', {
                ...props
            });
        },
    };
});

jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter', () => {
    return jest.fn().mockImplementation(() => ({
        addListener: jest.fn(),
        removeAllListeners: jest.fn(),
    }));
});

jest.mock('@react-native-google-signin/google-signin', () => {
    return {
        GoogleSignin: {
            configure: jest.fn(),
            signIn: jest.fn(() => Promise.resolve({ idToken: 'mockedIdToken' })),
            signOut: jest.fn(() => Promise.resolve()),
            isSignedIn: jest.fn(() => Promise.resolve(true)),
            getTokens: jest.fn(() => Promise.resolve({ accessToken: 'mockedAccessToken' })),
        },
    };
});

jest.mock('@/contexts/auth', () => ({
    useAuth: jest.fn().mockReturnValue({ user: { id: 'mocked-user-id' } }),
}));

//====================== Mock PDF ===========================
jest.mock('react-native/Libraries/Settings/Settings', () => ({
    get: jest.fn(),
    set: jest.fn(),
}));
jest.mock('react-native-pdf', () => {
    const React = require('react');
    return (props: PdfProps) => {
        const { onLoadComplete, onPageChanged } = props;

        React.useEffect(() => {
            if (onLoadComplete) {
                onLoadComplete(10, "1", { height: 100, width: 100 }, []); // Mock total pages as 10 with additional required arguments
            }
        }, [onLoadComplete]);

        React.useEffect(() => {
            if (onPageChanged) {
                onPageChanged(3, 10); // Mock current page as 1 and total pages as 10
            }
        }, [onPageChanged]);

        return React.createElement('Pdf', {
            ...props
        });
    };
});
//==========================================================

// Mock complet du module expo-file-system
jest.mock('expo-file-system', () => ({
    EncodingType: { Base64: 'base64' },
    cacheDirectory: 'mocked-cache-directory/',
    writeAsStringAsync: jest.fn(),
    StorageAccessFramework: {
        createFileAsync: jest.fn(),
        requestDirectoryPermissionsAsync: jest.fn(),
    },
    readAsStringAsync: jest.fn(),
    downloadAsync: jest.fn(),
}));


jest.mock('@react-native-firebase/auth', () => {
    return () => ({
        currentUser: { uid: 'mocked-uid' },
        signInWithEmailAndPassword: jest.fn(() => Promise.resolve()),
        createUserWithEmailAndPassword: jest.fn(() => Promise.resolve()),
        signOut: jest.fn(() => Promise.resolve()),
    });
});

jest.mock('@react-native-firebase/firestore', () => {
    return () => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                set: jest.fn(() => Promise.resolve()),
                get: jest.fn(() => Promise.resolve({ exists: true })),
            })),
        })),
    });
});

jest.mock('@react-native-firebase/functions', () => {
    return () => ({
        httpsCallable: jest.fn(() => jest.fn(() => Promise.resolve({ data: {} }))),
    });
});

// Mock de `getDownloadURL`
jest.mock('@/config/firebase', () => ({
    getDownloadURL: jest.fn(),
}));



describe('DocumentScreen', () => {

    beforeEach(() => {
        (getDownloadURL as jest.Mock).mockResolvedValue('https://example.com/document.pdf?alt=media');

        // Mock de la méthode `readAsStringAsync`
        (FileSystem.readAsStringAsync as jest.Mock).mockImplementation((fileUri, { encoding }) => {
            if (encoding === 'base64') {
                return Promise.resolve('mocked-base64-content'); // Valeur simulée pour base64
            }
            return Promise.resolve('mocked-content'); // Valeur par défaut
        });

        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
            uri: 'mocked-download-uri',
        });

        // Mock de `writeAsStringAsync`
        (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(true);

        // Mock de `StorageAccessFramework.createFileAsync`
        (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockResolvedValue('mocked-uri');

        // Mock de `StorageAccessFramework.requestDirectoryPermissionsAsync`
        (FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock).mockResolvedValue({
            granted: true,
            directoryUri: 'mocked-directory-uri',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const docSlidesMock = {
        title: 'Slides',
        type: 'slide',
        uri: 'https://example.com/slides.pdf',
    };

    const docExercisesMock = {
        title: 'Exercises',
        type: 'exercise',
        uri: 'https://example.com/exercises.pdf',
    };

    const docImageMock = {
        title: 'Image',
        type: 'image',
        uri: 'https://example.com/image.png',
    };

    const docSVGMock = {
        title: 'Image SVG',
        type: 'image',
        uri: 'https://example.com/image.svg',
    };

    const docWebpNgifMock = {
        title: 'Image WebP and GIF',
        type: 'image',
        uri: 'https://example.com/image.webp',
    };

    const docOtherMock = {
        title: 'Other',
        type: 'other',
        uri: 'https://example.com/other.py',
    };

    it('should render the document screen for slide doc', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Slides')).toBeTruthy();

        //Texts absence check
        expect(screen.queryByText('This document format cannot be displayed by Edweiss. \n You can download the document to view it.')).toBeNull();
        expect(screen.queryByText('An error occurred while loading the document.')).toBeNull();

        //Test IDs presence check
        expect(screen.getByTestId(testIDs.pageView)).toBeTruthy();

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));

        expect(screen.getByTestId(testIDs.pageNumView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.pageNumText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadIcon)).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId(testIDs.docError)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageView)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgView)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifView)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedView)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedText)).toBeNull();
    });

    it('should render the document screen for exercise doc', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docExercisesMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Exercises')).toBeTruthy();

        //Test IDs presence check
        await waitFor(() => screen.getByTestId(testIDs.pageNumView));

        expect(screen.getByTestId(testIDs.pageNumView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.pageNumText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadIcon)).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId(testIDs.docError)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageView)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgView)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifView)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedView)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedText)).toBeNull();
    });

    it('should render the document screen for image doc', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docImageMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Image')).toBeTruthy();

        //Test IDs presence check
        await waitFor(() => screen.getByTestId(testIDs.imageView));

        expect(screen.getByTestId(testIDs.downloadButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadIcon)).toBeTruthy();
        expect(screen.getByTestId(testIDs.imageView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.imageImage)).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId(testIDs.docError)).toBeNull();
        expect(screen.queryByTestId(testIDs.pageNumView)).toBeNull();
        expect(screen.queryByTestId(testIDs.pageNumText)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgView)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifView)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedView)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedText)).toBeNull();
    });

    it('should render the document screen for svg doc', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSVGMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Image SVG')).toBeTruthy();

        //Test IDs presence check
        await waitFor(() => screen.getByTestId(testIDs.svgView));

        expect(screen.getByTestId(testIDs.svgView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.svgImage)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadIcon)).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId(testIDs.docError)).toBeNull();
        expect(screen.queryByTestId(testIDs.pageNumView)).toBeNull();
        expect(screen.queryByTestId(testIDs.pageNumText)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageView)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifView)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedView)).toBeNull();
        expect(screen.queryByTestId(testIDs.notSupportedText)).toBeNull();
    });

    it('TO BE UPDATED WHEN INTEGRATING WEBP AND GIF SUPPORT : should render the document screen for webp and git doc', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docWebpNgifMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Image WebP and GIF')).toBeTruthy();

        //Test IDs presence check
        await waitFor(() => expect(screen.getByTestId(testIDs.notSupportedView)).toBeTruthy());
        expect(screen.getByTestId(testIDs.notSupportedText)).toBeTruthy();;
    });

    it('should handle downloading', async () => {

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));
        fireEvent.press(screen.getByTestId(testIDs.downloadButton));

        //Checks
        await waitFor(() => {
            expect(logSpy).toHaveBeenCalledWith('File saved in cache:', 'mocked-cache-directory/temp.pdf');
        });
        expect(logSpy).toHaveBeenCalledWith('Encoded data in Base64 retrieved.');
        expect(logSpy).toHaveBeenCalledWith('Encoded data in Base64 retrieved.');
        expect(logSpy).toHaveBeenCalledWith('Data size:', 'mocked-base64-content'.length);
        expect(logSpy).toHaveBeenCalledWith('Selected directory:', 'mocked-directory-uri');
        expect(logSpy).toHaveBeenCalledWith('File downloaded in :', 'mocked-uri');
        expect(logSpy).toHaveBeenCalledWith('File successfully saved.');
    });

    it('should render the document screen with an unsupported document', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docOtherMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        await waitFor(() => screen.getByText('This document format cannot be displayed by Edweiss. \n You can download the document to view it.'));

        expect(screen.getByText('Other')).toBeTruthy();

        //Test IDs presence check
        expect(screen.getByTestId(testIDs.pageView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.notSupportedView)).toBeTruthy();
        expect(screen.getByTestId(testIDs.notSupportedText)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadButton)).toBeTruthy();
        expect(screen.getByTestId(testIDs.downloadIcon)).toBeTruthy();

        //Test IDs absence check
        expect(screen.queryByTestId(testIDs.docError)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageView)).toBeNull();
        expect(screen.queryByTestId(testIDs.imageImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgView)).toBeNull();
        expect(screen.queryByTestId(testIDs.svgImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifView)).toBeNull();
        expect(screen.queryByTestId(testIDs.webpNgifImage)).toBeNull();
        expect(screen.queryByTestId(testIDs.pageNumView)).toBeNull();
        expect(screen.queryByTestId(testIDs.pageNumText)).toBeNull();
    });

    it('should call onError on Image', async () => {

        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docImageMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        await waitFor(() => expect(screen.getByTestId(testIDs.imageImage)).toBeTruthy());
        const image = screen.getByTestId(testIDs.imageImage);
        fireEvent(image, 'onError');
        expect(logSpy).toHaveBeenCalledWith('Error loading image');
        logSpy.mockRestore();
    });

    it('should call onError on SVG Image', async () => {

        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSVGMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        await waitFor(() => expect(screen.getByTestId(testIDs.svgImage)).toBeTruthy());
        const image = screen.getByTestId(testIDs.svgImage);
        fireEvent(image, 'onError');
        expect(logSpy).toHaveBeenCalledWith('Error loading SVG');
        logSpy.mockRestore();
    });

    it('should throw an error when downloadAsync() fails', async () => {

        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        (FileSystem.downloadAsync as jest.Mock).mockRejectedValue(
            new Error('Mocked error: Download failed.')
        );
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));
        fireEvent.press(screen.getByTestId(testIDs.downloadButton));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Error when downloading or encoding: ', new Error('Mocked error: Download failed.')));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Global Error: ', new Error('Mocked error: Download failed.')));
        logSpy.mockRestore();
    });

    it('should throw an error when requestDirectoryPermissionsAsync() fails', async () => {

        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        (FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock).mockRejectedValue(
            new Error('Mocked error: Permission request failed.')
        );
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));
        fireEvent.press(screen.getByTestId(testIDs.downloadButton));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Error when downloading the file: ', new Error('Mocked error: Permission request failed.')));
        logSpy.mockRestore();
    });

    it('should throw an error when createFileAsync() fails', async () => {

        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockRejectedValue(
            new Error('Mocked error: File creation failed.')
        );
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));
        fireEvent.press(screen.getByTestId(testIDs.downloadButton));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Error when creating the file: ', new Error('Mocked error: File creation failed.')));
        logSpy.mockRestore();
    });

    it('should throw an error when writeAsStringAsync() fails', async () => {

        const logSpy = jest.spyOn(console, 'error').mockImplementation();
        (FileSystem.writeAsStringAsync as jest.Mock).mockRejectedValue(
            new Error('Mocked error: Writing file failed.')
        );
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));
        fireEvent.press(screen.getByTestId(testIDs.downloadButton));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Error when creating the file: ', new Error('Mocked error: Writing file failed.')));
        logSpy.mockRestore();
    });

    it('should return if permission to access a file is denied', async () => {

        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        (FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock).mockResolvedValue({
            granted: false,
            directoryUri: 'mocked-directory-uri',
        });
        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        await waitFor(() => screen.getByTestId(testIDs.pageNumView));
        fireEvent.press(screen.getByTestId(testIDs.downloadButton));
        await waitFor(() => expect(logSpy).toHaveBeenCalledWith('Permission denied.'));
        logSpy.mockRestore();
    });
});

describe('DocumentScreen error when downloading url', () => {

    beforeEach(() => {
        (getDownloadURL as jest.Mock).mockRejectedValue(new Error('Mocked error'));

        // Mock de la méthode `readAsStringAsync`
        (FileSystem.readAsStringAsync as jest.Mock).mockImplementation((fileUri, { encoding }) => {
            if (encoding === 'base64') {
                return Promise.resolve('mocked-base64-content'); // Valeur simulée pour base64
            }
            return Promise.resolve('mocked-content'); // Valeur par défaut
        });

        (FileSystem.downloadAsync as jest.Mock).mockResolvedValue({
            uri: 'mocked-download-uri',
        });

        // Mock de `writeAsStringAsync`
        (FileSystem.writeAsStringAsync as jest.Mock).mockResolvedValue(true);

        // Mock de `StorageAccessFramework.createFileAsync`
        (FileSystem.StorageAccessFramework.createFileAsync as jest.Mock).mockResolvedValue('mocked-uri');

        // Mock de `StorageAccessFramework.requestDirectoryPermissionsAsync`
        (FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync as jest.Mock).mockResolvedValue({
            granted: true,
            directoryUri: 'mocked-directory-uri',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    const docSlidesMock = {
        title: 'Slides',
        type: 'slide',
        uri: 'https://example2.com/slides2.pdf',
    };

    it('should render the document screen for slide doc', async () => {

        (useRouteParameters as jest.Mock).mockReturnValue({ document: docSlidesMock });

        const screen = render(<DocumentScreen />);

        //Checks
        //Texts presence check
        expect(screen.getByText('Slides')).toBeTruthy();

        //Texts absence check
        await waitFor(() => expect(screen.getByText('An error occurred while loading the document.')).toBeTruthy());
    });
});

