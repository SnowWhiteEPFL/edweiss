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
        }
    });

    // Hooks
    const [numPages, setNumPages] = useState<number>(0);        // Total number of pages in the PDF
    const [page, setPage] = useState<number>(0);                // Current page, starting from 1
    const [uri, setUri] = useState<string>('');                 // Url state
    // UI display setting's hooks
    const [isLandscape, setIsLandscape] = useState<boolean>(false);       // Landscape display boolean for different UI
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);    // FullScreen display of pdf toggle
    const [widthPercent, setWidthPercent] = useState<string[]>([]);
    const [heightPercent, setHeightPercent] = useState<string[]>([]);

    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const questionsDoc = useDynamicDocs(CollectionOf<Question>(`courses/${courseName}/lectures/${lectureId}/questions`));

    // Load images when the component mounts
    useEffect(() => {
        if (lectureDoc) {
            getUri();
        }
    }, [lectureDoc]);

    useEffect(() => {
        ScreenOrientation.unlockAsync();
        updateUI(ScreenOrientation.Orientation.PORTRAIT_UP);
        const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
            const orientationValue = currentOrientation.orientationInfo.orientation;
            updateUI(orientationValue);
        };

        const screenOrientationListener =
            ScreenOrientation.addOrientationChangeListener(onOrientationChange);

        return () => {
            ScreenOrientation.removeOrientationChangeListener(screenOrientationListener);
        };
    }, []);

    if (!lectureDoc) return <TActivityIndicator size={40} />;
    const currentLecture = lectureDoc.data;

    // Function to go to the next page
    function pageForward() {
        if (page < numPages) setPage(page + 1);
    }
    // Function to go to the previous page
    function pageBack() {
        if (page > 1) setPage(page - 1);
    }

    // Funtion to set Uri to the desired one from firebase storage
    const getUri = async () => {
        if (!currentLecture.pdfUri) {
            console.error('PDF URI not found!');
            return;
        }
        try {
            const url = await getDownloadURL(currentLecture.pdfUri);
            setUri(url);
        } catch (error) {
            console.error('Error loading PDF URL:', error);
        }
    };

    // Function for updating the UI display values when switching through orientations an fullscreen modes
    function updateUI(orientation: ScreenOrientation.Orientation) {
        const bool = ((orientation == ScreenOrientation.Orientation.LANDSCAPE_LEFT || orientation == ScreenOrientation.Orientation.LANDSCAPE_RIGHT))
        setIsLandscape(bool);
        if (isFullscreen) {
            setWidthPercent(["100%", "0%"]);
            setHeightPercent(["100%", "0%"]);
        } else if (bool) {
            setHeightPercent(["100%", "100%"]);
            setWidthPercent(["60%", "40%"]);
        } else {
            setHeightPercent(["40%", "60%"]);
            setWidthPercent(["100%", "100%"]);
        }
    }

    // Landscape display for the screen
    const setLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        updateUI(ScreenOrientation.Orientation.LANDSCAPE_LEFT);
    };

    return (
        //Screen Display on landscape mode
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />

            <TView flexDirection={isLandscape ? 'row' : 'column'} flex={1} style={{ width: "100%" }}>

                <TView mr={'lg'} flexDirection='column' style={{ width: widthPercent[0] as DimensionValue, height: heightPercent[0] as DimensionValue, position: 'relative' }} >
                    <Pdf
                        trustAllCerts={false}
                        source={{ uri: uri }}
                        renderActivityIndicator={() =>
                            <ActivityIndicator size={'large'} />
                        }
                        enablePaging={true}
                        onLoadComplete={(totalPages) => setNumPages(totalPages)}
                        onError={(error) => console.log(error)}
                        page={page}
                        horizontal
                        style={{ flex: 1, width: (isFullscreen || !isLandscape) ? Dimensions.get('window').width : Dimensions.get('window').width * 0.6, height: isLandscape ? Dimensions.get('window').height : Dimensions.get('window').height * 0.6 }} />

                    <TView alignItems='center' flexDirection='row' justifyContent='space-between' style={{ position: 'absolute', bottom: 0, left: 0, width: widthPercent[0] as DimensionValue }} backgroundColor='overlay0'>
                        {/* Buttons for page change and fullScreen toggle */}

                        <TView flexDirection='row' justifyContent='space-between' pr={'sm'} pl={'sm'}>
                            <TTouchableOpacity backgroundColor='transparent' onPress={pageBack} pr={'md'}>
                                <Icon size={'xl'} name='arrow-back-circle-outline' color='text'></Icon>
                            </TTouchableOpacity>

                            <TTouchableOpacity backgroundColor='transparent' onPress={pageForward} pl={'md'}>
                                <Icon size={'xl'} name='arrow-forward-circle-outline' color='text'></Icon>
                            </TTouchableOpacity>
                        </TView>

                        <TTouchableOpacity backgroundColor='transparent' onPress={() => {
                            !isLandscape && setLandscape();
                            isLandscape && ScreenOrientation.unlockAsync();
                            setIsFullscreen(!isFullscreen);
                        }}>
                            <Icon size={'xl'} name={isFullscreen ? 'contract-outline' : 'expand-outline'} dark='text'></Icon>
                        </TTouchableOpacity>
                    </TView>
                </TView>

                <TView flexDirection='column' style={{ width: widthPercent[1] as DimensionValue, height: heightPercent[1] as DimensionValue }}>
                    {isFullscreen ?
                        <TView></TView> : // Speech to Text transcript display and question forum display
                        <>
                            <TScrollView b={'sm'} mt={25} mr={'md'} ml={'md'} radius={'lg'} flex={1}>
                                {currentLecture.audioTranscript?.[page] ? (
                                    <TText pl={'sm'} pr={'sm'}>{currentLecture.audioTranscript[page]}</TText>
                                ) : (
                                    <TText pt={'sm'} pl={'sm'} pr={'sm'} color='overlay0'>
                                        {t(`showtime:lecturer_transcript_deftxt`)}
                                    </TText>
                                )}
                            </TScrollView>

                            <TScrollView flex={0.5} mt={15} mr={'md'} ml={'md'} mb={15}>
                                <StudentQuestion courseName={courseName} lectureId={lectureId} questionsDoc={questionsDoc} />
                            </TScrollView>
                        </>}
                </TView>
            </TView>
        </>
    );
};

export default LectureScreen;

