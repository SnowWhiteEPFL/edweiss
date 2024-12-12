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
import { TranscriptModeModal } from '@/components/lectures/slides/modal';
import StudentQuestion from '@/components/lectures/slides/StudentQuestion';
import { CollectionOf, getDownloadURL } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useTheme from '@/hooks/theme/useTheme';
import useListenToMessages from '@/hooks/useListenToMessages';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { transModeIconMap, transModeIDMap } from '@/utils/lectures/slides/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, DimensionValue } from 'react-native';
import Pdf from 'react-native-pdf';

// Types
type Lecture = LectureDisplay.Lecture;
type Question = LectureDisplay.Question;
type TranscriptLangMode = LectureDisplay.TranscriptLangMode;

// ------------------------------------------------------------
// --------------------  Lecture Screen  ----------------------
// ------------------------------------------------------------

const LectureScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;


    // Modal References
    const modalRefTranscriptMode = useRef<BottomSheetModal>(null);

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
    const [isLandscape, setIsLandscape] = useState<boolean>(false);       // Landscape display boolean for different UI
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);    // FullScreen display of pdf toggle
    const colorScheme = useTheme();    // Get the current color scheme (light or dark)
    const [transMode, setTransMode] = useState<TranscriptLangMode>('original');          // Current transcript mode 

    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const questionsDoc = useDynamicDocs(CollectionOf<Question>(`courses/${courseName}/lectures/${lectureId}/questions`));

    // Load images when the component mounts
    useEffect(() => {
        if (lectureDoc?.data.pdfUri) {
            getUri();
        }
    }, [lectureDoc]);

    useFocusEffect(
        useCallback(() => {
            // This effect runs every time the screen is unfocused or focused
            return () => {
                // Unlock orientation whenever the screen loses focus (navigating back)
                ScreenOrientation.unlockAsync();
            };
        }, [])
    );

    // Landscape display for the screen
    const setLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    // Landscape display for the screen
    const setPortrait = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    };

    useEffect(() => {
        setPortrait();
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
                backgroundColor: colorScheme == "dark" ? "#181825" : "#e6e9ef",
                width: Dimensions.get('window').width * widthPorp,
                height: Dimensions.get('window').height * heightProp,
            }}
        />
    );

    const ControlButtons = () => (
        <TView alignItems='center' flexDirection='row' justifyContent='space-between' style={{ position: 'absolute', backgroundColor: colorScheme == "dark" ? "rgba(108, 112, 134, 0.5)" : "rgba(156, 160, 176, 0.5)", bottom: 0, left: 0, width: '100%' }}>
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
                <Icon size={'xl'} name={isFullscreen ? 'contract-outline' : 'expand-outline'} color='text' testID='fullscreen-toggle'></Icon>
            </TTouchableOpacity>
        </TView >
    );

    const ContentView = (widthPercent: string, heightPercent: string) => (
        <TView flexDirection='column' mr={'xl'} style={{ width: widthPercent as DimensionValue, height: heightPercent as DimensionValue }}>

            {/* Transcript selection */}
            <TView style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}>
                <TTouchableOpacity
                    backgroundColor='crust'
                    borderColor='text' p={'sm'} b={1} ml={'sm'} radius={1000}
                    onPress={() => modalRefTranscriptMode.current?.present()}
                    testID='st-trans-mode-sel-button'>

                    {transMode === 'original' ? (
                        <Icon size={'lg'} name='language-outline' color='text'></Icon>
                    ) : (
                        <TText size={'lg'}>{transModeIconMap[transMode]}</TText>
                    )}
                </TTouchableOpacity>

            </TView>


            {/* The Audio Transcript display */}
            <TScrollView b={'sm'} mt={25} mr={'md'} ml={'md'} radius={'lg'} flex={1}>

                {/* Transcript Display */}
                {currentLecture.audioTranscript?.[currentPage] ? (
                    // Display's Teacher
                    <TText pl={'sm'} pr={'sm'}>{currentLecture.audioTranscript[currentPage][transModeIDMap[transMode]]}</TText>
                ) : (

                    // Default Text
                    <TText pt={'sm'} pl={'sm'} pr={'sm'} color='overlay0'>
                        {t(`showtime:lecturer_transcript_deftxt`)}
                    </TText>
                )}
            </TScrollView>*/}

            {/* Student Questions Display */}
            <TScrollView flex={0.5} mt={15} mr={'md'} ml={'md'} mb={15}>
                <StudentQuestion courseName={courseName} lectureId={lectureId} questionsDoc={questionsDoc} />
            </TScrollView>
        </TView>
    );

    return (
        //Screen Display on landscape mode
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />

            {/* Main Screen by default on Full Screen*/}
            {isFullscreen ?

                <TView mr={'lg'} flexDirection='column' style={{ width: '100%', height: '100%', position: 'relative' }} >
                    {PDFViewer(uri, 1, 1)}
                    {ControlButtons()}
                </TView>

                // Landscape Mode handling
                : isLandscape ?
                    <TView flexDirection={'row'} flex={1} style={{ width: '100%' }}>
                        <TView flexDirection='column' style={{ width: '60%', height: '100%', position: 'relative' }} >
                            {PDFViewer(uri, 0.6, 1)}
                            {ControlButtons()}
                        </TView>
                        {ContentView('40%', '100%')}
                    </TView>

                    // Portrait Mode handling
                    :
                    <TView flexDirection={'column'} flex={1} style={{ width: '100%' }}>
                        <TView flexDirection='column' style={{ width: '100%', height: '40%', position: 'relative' }} >
                            {PDFViewer(uri, 1, 0.6)}
                            {ControlButtons()}
                        </TView>
                        {ContentView('100%', '60%')}
                    </TView>
            }

            {/* Modal */}
            <TranscriptModeModal modalRef={modalRefTranscriptMode} transMode={transMode} setTransMode={setTransMode} onClose={() => modalRefTranscriptMode.current?.close()} />

        </>
    );
};

export default LectureScreen;