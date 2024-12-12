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
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image } from 'react-native';
//import ReactNativeFS from 'react-native-fs';
import SVGImage from '@/components/core/SVGImage';
import * as FileSystem from 'expo-file-system';
import Pdf from 'react-native-pdf';


export const DocumentRouteSignature: ApplicationRouteSignature<{
    document: MaterialDocument,
}> = {
    path: `/courses/[id]/materials/[materialId]/document`
}

// Supported document formats
type DocumentFormat = 'pdf' | 'jpg' | 'png' | 'jpeg' | 'gif' | 'webp' | 'svg' | string;

// ------------------------------------------------------------
// --------------------  Document Screen  ----------------------
// ------------------------------------------------------------

const DocumentScreen: ApplicationRoute = () => {
    const { document } = useRouteParameters(DocumentRouteSignature);

    const docFormat: DocumentFormat = document.uri.substring(document.uri.lastIndexOf('.') + 1).toLowerCase();

    const [numPages, setNumPages] = useState<number>(0); // Total number of pages
    const [currentPage, setCurrentPage] = useState<number>(1); // Current active page
    const [url, setUrl] = useState<string>(''); // URL of the PDF
    const [hasError, setHasError] = useState<boolean>(false); // Track if an error should be shown


    useEffect(() => {
        if (document.uri) {
            getUrl();
        }
    }, [document]);

    const getUrl = async () => {
        try {
            const url = await getDownloadURL(document.uri);
            setUrl(url);
            setHasError(false); // Reset any existing error
        } catch (error) {
            setHasError(true);
            console.error('Error loading URL:', error);
        }
    };



    // ------------------------------------------------------------
    // ----------------------  Document Viewer  -------------------
    // ------------------------------------------------------------

    const docViewer = (uri: string) => {
        switch (docFormat) {
            case 'pdf':
                return PDFViewer(uri);
            case 'jpg':
            case 'jpeg':
            case 'png':
                return ImageViewer(uri);
            case 'svg':
                return SVGViewer(uri);
            case 'gif':
            case 'webp':
                return;
            //return WEBPnGIFViewer(uri);
            default:
                return NotSupportedViewer();
        }
    };

    // PDF Viewer for PDF
    const PDFViewer = (uri: string) => (
        <Pdf
            trustAllCerts={false}
            source={{ uri }}
            renderActivityIndicator={() => <ActivityIndicator size="large" />}
            horizontal={false}
            onPageChanged={(currentPage) => setCurrentPage(currentPage)}
            onLoadComplete={(totalPages) => { setNumPages(totalPages); }}
            onError={() => console.error('Error loading PDF')}
            style={{
                flex: 1,
                width: '100%',
                height: '100%',
            }}
        />
    );

    // Image Viewer for JPG, JPEG and PNG
    const ImageViewer = (uri: string) => (
        console.log('url ', uri),
        <TView flex={1} justifyContent='flex-start' alignItems='center' pb={120} >
            <Image
                source={{ uri }}
                style={{ flex: 1, width: '100%', height: '100%' }}
                resizeMode="contain"
                onError={() => console.error('Error loading image')}
            />
        </TView>
    );

    // SVG Viewer for SVG
    const SVGViewer = (uri: string) => (
        <TView flex={1} justifyContent='center' alignItems='center' pb={120} >
            <SVGImage
                uri={uri}
                onError={() => console.error('Error loading SVG')}
            />
        </TView>
    );

    // const WEBPnGIFViewer = (uri: string) => (
    //     <TView flex={1} justifyContent='center' alignItems='center' pb={120} >
    //         <FastImage
    //             style={{ width: 200, height: 200 }}
    //             source={{
    //                 uri: uri, // .webp or .gif URL
    //                 priority: FastImage.priority.normal,
    //             }}
    //             resizeMode='contain'
    //         />
    //     </TView>
    // );

    // Viewer for unsupported formats
    const NotSupportedViewer = () => (
        <TView flex={1} justifyContent='center' alignItems='center' pb={120} >
            <TText color='red' bold>
                {t('course:document_not_supported')}
            </TText>
        </TView>
    );


    // ------------------------------------------------------------
    // --------------------  Download and Save  --------------------
    // ------------------------------------------------------------

    const handleDownloadAndSave = async () => {
        try {
            // Download the file and encode it in Base64
            const base64Data = await downloadAndEncodeBase64(url);

            // Save the file in the selected directory
            await saveToSelectedDirectory(base64Data, document.uri);
        } catch (error) {
            console.error('Global Error: ', error);
        }
    };

    const downloadAndEncodeBase64 = async (url: string) => {
        try {
            // Save the file in the cache directory
            const fileUri = FileSystem.cacheDirectory + `temp.${docFormat}`; // Temporary name
            await FileSystem.downloadAsync(url, fileUri);           // Download the file
            console.log('File saved in cache:', fileUri);

            // Read the file and get its content encoded in Base64
            const base64Data = await FileSystem.readAsStringAsync(fileUri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('Encoded data in Base64 retrieved.');
            console.log('Data size:', base64Data.length);
            return base64Data;
        } catch (error) {
            console.error('Error when downloading or encoding:', error);
            throw error;
        }
    };

    const saveToSelectedDirectory = async (base64Data: string, fileName: string) => {
        try {
            // Ask the user to select a directory
            const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (!permissions.granted) {
                console.log('Permission denied.');
                return;
            }

            console.log('Selected directory:', permissions.directoryUri);

            // Create the file in the selected directory
            await FileSystem.StorageAccessFramework.createFileAsync(
                permissions.directoryUri,
                fileName,
                `application/${docFormat}` // MIME type
            )
                .then(async (uri) => {
                    console.log('File downloaded in :', uri);

                    // Write the Base64 data in the file
                    await FileSystem.writeAsStringAsync(uri, base64Data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });
                    console.log('File successfully saved.');
                })
                .catch((e) => {
                    console.error('Error when creating the file: ', e);
                });
        } catch (e) {
            console.error('Error when downloading the file: ', e);
        }
    };



    // ------------------------------------------------------------
    // ----------------------  Page Number  -----------------------
    // ------------------------------------------------------------
    const displayPageNumber = () => (
        <TView radius={5} px={10} py={5} style={{ position: 'absolute', top: 10, left: 10, backgroundColor: 'rgba(128, 128, 128, 0.2)' }}>
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
                    <TTouchableOpacity p={10} onPress={handleDownloadAndSave}>
                        <Icon name='download' size={'xl'} color='darkBlue' mr={5} />
                    </TTouchableOpacity>
                }
            />

            <TView mr={'lg'} flexDirection='column' justifyContent='center' style={{ width: '100%', height: '100%', position: 'relative' }} >
                {url && docViewer(url)}
                {hasError && (
                    <TText color="red" bold align='center' mt={20}>
                        {t('course:document_error')}
                    </TText>
                )}
            </TView>
            {url && docFormat === 'pdf' && displayPageNumber()}

        </>
    );
};

export default DocumentScreen;