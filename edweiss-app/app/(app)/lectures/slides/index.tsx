import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { getDownloadURL } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import useListenToMessages from '@/hooks/useListenToMessages';
import LectureDisplay from '@/model/lectures/lectureDoc';
import Quizzes from '@/model/quizzes';
import { Timestamp } from '@react-native-firebase/firestore';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking } from 'react-native';
import Pdf from 'react-native-pdf';

const LectureDoc: ApplicationRoute = () => {
    const sampleQuiz: Quizzes.Quiz = { // Quiz model
        name: "Sample Quiz 1",
        deadline: "2024-12-31",
        exercises: [],
        answers: []
    };
    const quiz1: LectureDisplay.QuizLectureEvent = { // Quiz sample for currentEvent update
        type: 'quiz', quizModel: sampleQuiz,
        done: false,
        pageNumber: 1
    };
    const [lectureDoc, setLectureDoc] = useState<LectureDisplay.Lecture>({  // Lecture Document sample 
        uri: 'China-101.pdf', // Uri for pdf display taken from Firebase cloud storage
        audioRecording: [],
        events: [],
        availableToStudents: true,
        ends: new Timestamp(0, 0),
        starts: new Timestamp(0, 0)
    });
    const [numPages, setNumPages] = useState<number>(0);  // Total number of pages in the PDF
    const [page, setPage] = useState<number>(0);  // Current page, starting from 1
    const [uri, setUri] = useState<string>('');  // Url state
    //const [isLandscape, setIsLandscape] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false); // FullScreen display of pdf toggle

    // FCM token receiver for changing pages 
    useListenToMessages((msg) => {
        if (msg.type == "go_to_slide") {
            setPage(msg.slideIndex);
        }
    });

    // Landscape display for the screen
    const setLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    // Portrait display for the screen
    const setPortrait = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    // Function to go to the next page
    function pageForward() {
        if (page < numPages) setPage(page + 1);
    }
    // Function to go to the previous page
    function pageBack() {
        if (page > 1) setPage(page - 1);
    }

    // Funtion to set Uri to the desired one from firebase storage
    async function getUri() {
        setUri(await getDownloadURL(lectureDoc.uri));
    }

    // Load images when the component mounts
    useEffect(() => {
        getUri();
        setLandscape();

        /* TODO for a next sprint, detection of rotation change from landscape to portrait and different UI for each mode

        // Orientation change listener
        const subscription = ScreenOrientation.addOrientationChangeListener(({ orientationInfo }) => {
            const { orientation } = orientationInfo;
            // If the orientation is portrait (either portrait up or down), trigger setPortrait
            if (
                orientation === ScreenOrientation.Orientation.PORTRAIT_UP ||
                orientation === ScreenOrientation.Orientation.PORTRAIT_DOWN
            ) {
                setPortrait();
                setIsLandscape(false);
            } else {
                setLandscape();
                setIsLandscape(true);
            }
        }); 

        // Cleanup function to remove listener when component unmounts
        return () => {
            ScreenOrientation.removeOrientationChangeListener(subscription);
        };*/

    }, []);

    return (
        //Screen Display on landscape mode
        <>
            { }
            <RouteHeader title={"Lecture's Slides"} />
            <TView flexDirection={'row'} flex={1} style={{ width: "100%" }}>
                <TView mr={'lg'} flexDirection='column' style={{ width: isFullscreen ? "100%" : "60%" }}>
                    <Pdf
                        trustAllCerts={false}
                        source={{ uri: uri }} // Uri to be loaded
                        renderActivityIndicator={() =>
                            <ActivityIndicator size={'large'} /> // Loading visual guide for pdf
                        }
                        enablePaging={true} // Slide display of "page by page" paging style
                        onLoadComplete={(totalPages) => setNumPages(totalPages)} // Once pdf load completed define total number of pages
                        onPageChanged={(page) => { setPage(page); }} // Set the page state to new value
                        onError={(error) => console.log(error)} // Console log in case of error
                        onPressLink={(link) => Linking.openURL(link)} // Link handling function for pdf containing links
                        page={page} // modify page to the current state, handles changes from remote control
                        horizontal // horizontal scroll for page change
                        style={{
                            flex: 1,
                            width: isFullscreen ? Dimensions.get('window').width : Dimensions.get('window').width * 0.6, //width change depending on fullScreen toggle, gets phone dimensions
                            height: Dimensions.get('window').height
                        }} />

                    <TView flexDirection='row' justifyContent='space-between' >
                        {/* Buttons for page change and fullScreen toggle */}
                        <TTouchableOpacity backgroundColor='base' onPress={pageBack}>
                            <Icon size={'xl'} name={'arrow-back-circle-outline'} dark='text'></Icon>
                        </TTouchableOpacity>

                        <TText color='red'>{page}/{numPages}</TText>

                        <TTouchableOpacity backgroundColor='base' onPress={pageForward}>
                            <Icon size={'xl'} name={'arrow-forward-circle-outline'} dark='text'></Icon>
                        </TTouchableOpacity>

                        <TTouchableOpacity backgroundColor='base' onPress={() => setIsFullscreen(!isFullscreen)}>
                            <Icon size={'xl'} name={isFullscreen ? 'contract-outline' : 'expand-outline'} dark='text'></Icon>
                        </TTouchableOpacity>
                    </TView>
                </TView>

                <FancyButton onPress={() => {
                    console.log("Toogle events |||"); (lectureDoc.currentEvent) ? setLectureDoc(prevLectureDoc => ({ // Toggle for quiz event 
                        ...prevLectureDoc,          // Spread operator to keep other properties
                        currentEvent: undefined     // Only update currentEvent
                    })) : setLectureDoc(prevLectureDoc => ({
                        ...prevLectureDoc,          // Spread operator to keep other properties
                        currentEvent: quiz1         // Only update currentEvent
                    }));
                }} >
                    <TText> Quiz</TText>
                </FancyButton>
                <>{lectureDoc.currentEvent != undefined && (  // Check for existing quiz event for overlay display
                    <TView justifyContent='center' backgroundColor='base' style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1000 }}>
                        <TText mb={'md'} align='center' >This is the quiz</TText>
                        <FancyButton icon='bookmark-outline' onPress={() => setLectureDoc(prevLectureDoc => ({
                            ...prevLectureDoc,      // Spread operator to keep other properties
                            currentEvent: undefined  // Disable quiz event
                        }))}><TText>Save Answer</TText></FancyButton>
                    </TView>
                )}</>

                <TView flexDirection='column' style={{ width: isFullscreen ? "0%" : "40%" }}>
                    {isFullscreen ?  // Disable display in case of fullScreen toggled
                        <TView></TView> : // Speech to Text translation display and question forum display
                        <>
                            <TScrollView b={'sm'} mb={'md'}>
                                <TText> Speech to Text here</TText>
                            </TScrollView><TScrollView flex={0.5} b={'xs'} mb={'md'}>
                                <FancyTextInput label='Ask your questions' mt={'xl'} icon='chatbubbles-outline' />
                            </TScrollView>
                        </>}
                </TView>
            </TView>
        </>
    );
};

export default LectureDoc;