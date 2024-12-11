/**
 * @file document.tsx
 * @description Main screen for displaying and downloading a document
 * @author Florian DINANT
 */

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import { getDownloadURL } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import { MaterialDocument } from '@/model/school/courses';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
//import ReactNativeFS from 'react-native-fs';
import Pdf from 'react-native-pdf';


export const DocumentRouteSignature: ApplicationRouteSignature<{
    document: MaterialDocument,
}> = {
    path: `/courses/[id]/materials/[materialId]/document`
}

// ------------------------------------------------------------
// --------------------  Document Screen  ----------------------
// ------------------------------------------------------------

const DocumentScreen: ApplicationRoute = () => {
    const { document } = useRouteParameters(DocumentRouteSignature);

    const [numPages, setNumPages] = useState<number>(0); // Total number of pages
    const [currentPage, setCurrentPage] = useState<number>(1); // Current active page
    const [url, setUrl] = useState<string>(''); // URL of the PDF
    const [hasError, setHasError] = useState<boolean>(false); // Track if an error should be shown

    useEffect(() => {
        if (document.uri) {
            getUri();
        }
    }, [document]);

    // Timeout ID to control error delay
    const errorTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const getUri = async () => {
        try {
            const url = await getDownloadURL(document.uri);
            setUrl(url);
            setHasError(false); // Reset any existing error
        } catch (error) {
            console.error('Error loading PDF URL:', error);
        }
    };


    const handlePdfError = (error: any) => {
        // Start a timeout to delay the error reporting
        if (!errorTimeoutRef.current) {
            errorTimeoutRef.current = setTimeout(() => {
                setHasError(true); // Only set error after timeout
                console.error('PDF loading error:', error);
            }, 1000); // Delay of 1 second
        }
    };

    // Clear timeout if PDF successfully loads
    const handlePdfLoadSuccess = () => {
        if (errorTimeoutRef.current) {
            clearTimeout(errorTimeoutRef.current);
            errorTimeoutRef.current = null;
        }
        setHasError(false); // No error
    };

    const PDFViewer = (uri: string) => (
        <Pdf
            trustAllCerts={false}
            source={{ uri }}
            renderActivityIndicator={() => <ActivityIndicator size="large" />}
            horizontal={false} // Enable vertical scrolling
            onLoadComplete={(totalPages) => {
                setNumPages(totalPages);
                handlePdfLoadSuccess(); // Call success handler
            }}
            onPageChanged={(currentPage) => setCurrentPage(currentPage)}
            onError={handlePdfError} // Call delayed error handler
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
            }}
        />
    );

    const displayPageNumber = (currentPage: number, numPages: number) => (
        <TView radius={5} px={10} py={5} style={{ position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(128, 128, 128, 0.2)' }}>
            <TText bold color='text'>
                {currentPage + t('course:of') + numPages}
            </TText>
        </TView>

    );

    return (
        <>
            <RouteHeader
                title={document.title}
                isBold
                right={
                    <TTouchableOpacity p={10} onPress={async () => {
                        try {
                            // File selection using DocumentPicker
                            const result = await DocumentPicker.getDocumentAsync({
                                type: '*/*',
                                copyToCacheDirectory: true,
                                multiple: false,
                            });

                            if (result.canceled) {
                                console.log('The user cancelled the document selection');
                            } else {
                                const asset = result.assets && result.assets.length > 0 ? result.assets[0] : null;

                                if (asset) {
                                    console.log('File Informations:', {
                                        name: asset.name,
                                        size: asset.size,
                                        uri: asset.uri,
                                    });

                                    // Prompt user to confirm where to save the file
                                    const downloadDirectory = `${FileSystem.documentDirectory}downloads/`; // Change directory as needed
                                    const fileUri = `${downloadDirectory}${asset.name}`;

                                    // Create directory if it doesn't exist
                                    await FileSystem.makeDirectoryAsync(downloadDirectory, { intermediates: true });

                                    // Copy the file to the selected directory
                                    await FileSystem.copyAsync({
                                        from: asset.uri,
                                        to: fileUri,
                                    });

                                    Alert.alert('Success', `File downloaded to: ${fileUri}`);
                                    console.log('File saved at:', fileUri);
                                }
                            }
                        } catch (error) {
                            console.error('Error selecting document', error);
                            Alert.alert('Error', 'An error occurred while selecting the document.');
                        }
                    }}>
                        <Icon name='download' size={'xl'} color='darkBlue' mr={5} />
                    </TTouchableOpacity>
                }
            />

            <TView mr={'lg'} flexDirection='column' style={{ width: '100%', height: '100%', position: 'relative' }} >
                {url && PDFViewer(url)}
                {hasError && (
                    <TText color="red" style={{ textAlign: 'center', marginTop: 20 }}>
                        {t('course:document_error')}
                    </TText>
                )}
            </TView>
            {url && displayPageNumber(currentPage, numPages)}

        </>
    );
};

export default DocumentScreen;