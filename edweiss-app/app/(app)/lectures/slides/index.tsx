/**
 * @file index.tsx
 * @description Main screen for displaying and managing lecture slides in the edweiss app
 * @author Gustavo Maia & Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import StudentQuestion from '@/components/lectures/slides/StudentQuestion';
import { CollectionOf, getDownloadURL } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useListenToMessages from '@/hooks/useListenToMessages';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, DimensionValue } from 'react-native';
import Pdf from 'react-native-pdf';

// Types
type Lecture = LectureDisplay.Lecture;
type Question = LectureDisplay.Question;

// ------------------------------------------------------------
// --------------------  Lecture Screen  ----------------------
// ------------------------------------------------------------

const LectureScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;

    // FCM token receiver for changing pages 
    useListenToMessages((msg) => {
        if (msg.type == "go_to_slide") {
            setPage(msg.slideIndex);
            setCurrentPage(msg.slideIndex); // Sync current page number display 
        }
    });

    // Hooks
    const [numPages, setNumPages] = useState<number>(0);        // Total number of pages in the PDF
    const [page, setPage] = useState<number>(1);                // Current page, starting from 1
    const [currentPage, setCurrentPage] = useState<number>(1);  // Track swiped or active page
    const [uri, setUri] = useState<string>('');                 // Url state
    // UI display setting's hooks
    const [isLandscape, setIsLandscape] = useState<boolean>(true);       // Landscape display boolean for different UI
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);    // FullScreen display of pdf toggle


    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const questionsDoc = useDynamicDocs(CollectionOf<Question>(`courses/${courseName}/lectures/${lectureId}/questions`));

    // Load images when the component mounts
    useEffect(() => {
        if (lectureDoc?.data.pdfUri) {
            getUri();
        }
    }, [lectureDoc]);


    // Landscape display for the screen
    const setLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };

    useEffect(() => {
        setLandscape();
        ScreenOrientation.unlockAsync();
        const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
            const orientationValue = currentOrientation.orientationInfo.orientation;
            setIsLandscape(orientationValue == ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientationValue == ScreenOrientation.Orientation.LANDSCAPE_RIGHT);
        };

        const screenOrientationListener =
            ScreenOrientation.addOrientationChangeListener(onOrientationChange);

        return () => {
            ScreenOrientation.removeOrientationChangeListener(screenOrientationListener);
        };
    }, []);

    if (!lectureDoc) return <TActivityIndicator size={40} testID='activity-indicator' />;
    const currentLecture = lectureDoc.data;

    // Function to go to the next page
    function pageForward() {
        if (currentPage < numPages) { setPage(currentPage + 1); setCurrentPage(currentPage + 1); }
    }
    // Function to go to the previous page
    const pageBack = () => {
        if (currentPage > 1) { setPage(currentPage - 1); setCurrentPage(currentPage - 1); }
    };

    // Funtion to set Uri to the desired one from firebase storage
    const getUri = async () => {
        try {
            const url = await getDownloadURL(currentLecture.pdfUri);
            setUri(url);
        } catch (error) {
            console.error('Error loading PDF URL:', error);
        }
    };

    const PDFViewer = (uri: string, widthPorp: number, heightProp: number) => (
        <Pdf
            trustAllCerts={false}
            source={{ uri }}
            renderActivityIndicator={() => <ActivityIndicator size="large" />}
            enablePaging
            onLoadComplete={(totalPages) => setNumPages(totalPages)}
            onPageChanged={(currentPage) => setCurrentPage(currentPage)}
            onError={(error) => console.log(error)}
            page={page}
            horizontal
            style={{
                flex: 1,
                width: Dimensions.get('window').width * widthPorp,
                height: Dimensions.get('window').height * heightProp,
            }}
        />
    );

    const ControlButtons = () => (
        <TView alignItems='center' flexDirection='row' justifyContent='space-between' style={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }} backgroundColor='overlay0'>
            {/* Buttons for page change and fullScreen toggle */}

            <TView flexDirection='row' justifyContent='space-between' pr={'sm'} pl={'sm'}>
                <TTouchableOpacity backgroundColor='transparent' onPress={pageBack} pr={'md'}>
                    <Icon size={'xl'} name='arrow-back-circle-outline' color='text'></Icon>
                </TTouchableOpacity>

                <TText>{currentPage}/{numPages}</TText>

                <TTouchableOpacity backgroundColor='transparent' onPress={pageForward} pl={'md'}>
                    <Icon size={'xl'} name='arrow-forward-circle-outline' color='text'></Icon>
                </TTouchableOpacity>
            </TView>

            <TTouchableOpacity backgroundColor='transparent' onPress={() => {
                !isLandscape && setLandscape();
                isLandscape && ScreenOrientation.unlockAsync();
                setIsFullscreen(!isFullscreen);
            }}>
                <Icon size={'xl'} name={isFullscreen ? 'contract-outline' : 'expand-outline'} dark='text' testID='fullscreen-toggle'></Icon>
            </TTouchableOpacity>
        </TView >
    );

    const ContentView = (widthPercent: string, heightPercent: string) => (
        <TView flexDirection='column' mr={'xl'} style={{ width: widthPercent as DimensionValue, height: heightPercent as DimensionValue }}>
            <TScrollView b={'sm'} mt={25} mr={'md'} ml={'md'} radius={'lg'} flex={1}>
                {currentLecture.audioTranscript?.[currentPage] ? (
                    <TText pl={'sm'} pr={'sm'}>{currentLecture.audioTranscript[currentPage]}</TText>
                ) : (
                    <TText pt={'sm'} pl={'sm'} pr={'sm'} color='overlay0'>
                        {t(`showtime:lecturer_transcript_deftxt`)}
                    </TText>
                )}
            </TScrollView>

            <TScrollView flex={0.5} mt={15} mr={'md'} ml={'md'} mb={15}>
                <StudentQuestion courseName={courseName} lectureId={lectureId} questionsDoc={questionsDoc} />
            </TScrollView>
        </TView>
    );

    return (
        //Screen Display on landscape mode
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />

            {isFullscreen ?
                <TView mr={'lg'} flexDirection='column' style={{ width: '100%', height: '100%', position: 'relative' }} >
                    {PDFViewer(uri, 1, 1)}
                    {ControlButtons()}
                </TView>
                : isLandscape ?
                    <TView flexDirection={'row'} flex={1} style={{ width: '100%' }}>
                        <TView flexDirection='column' style={{ width: '60%', height: '100%', position: 'relative' }} >
                            {PDFViewer(uri, 0.6, 1)}
                            {ControlButtons()}
                        </TView>
                        {ContentView('40%', '100%')}
                    </TView>
                    :
                    <TView flexDirection={'column'} flex={1} style={{ width: '100%' }}>
                        <TView flexDirection='column' style={{ width: '100%', height: '40%', position: 'relative' }} >
                            {PDFViewer(uri, 1, 0.6)}
                            {ControlButtons()}
                        </TView>
                        {ContentView('100%', '60%')}
                    </TView>
            }

        </>
    );
};

export default LectureScreen;