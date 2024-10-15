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

// type Lecture = LectureDisplay.Lecture;

const Slide: ApplicationRoute = () => {
    const tmp: Quizzes.Quiz = {
        name: "Sample Quiz 1",
        deadline: "2024-12-31", // Optional deadline (can be omitted if not needed)
        exercises: [
            // Multiple Choice Question (MCQ)
            {
                question: "What is the capital of France?",
                imageURL: undefined, // No image URL for this question
                propositions: [
                    { id: 1, description: "Paris", type: "MCQProposition" },
                    { id: 2, description: "London", type: "MCQProposition" },
                    { id: 3, description: "Berlin", type: "MCQProposition" },
                    { id: 4, description: "Madrid", type: "MCQProposition" }
                ],
                answersIndices: [0], // The correct answer is "Paris"
                numberOfAnswers: 1, // Only one correct answer
                type: "MCQ"
            },
            // True or False Question (TF)
            {
                question: "The Earth is flat.",
                imageURL: undefined, // No image URL for this question
                answer: false, // The answer is false
                type: "TF"
            }
        ],
        answers: [
            // Example of how the answers might look for this quiz
            {
                type: "MCQAnswersIndices",
                value: [0] // Answered "Paris" for the first question
            },
            {
                type: "TFAnswer",
                value: false // Answered "False" for the second question
            }
        ]
    };
    const quiz1: LectureDisplay.QuizLectureEvent = {
        type: 'quiz', quizModel: tmp,
        done: false,
        pageNumber: 1
    };
    const [lectureDoc, setLectureDoc] = useState<LectureDisplay.Lecture>({ uri: 'China-101.pdf', audioRecording: [], events: [], availableToStudents: true, ends: new Timestamp(0, 0), starts: new Timestamp(0, 0) });
    const [numPages, setNumPages] = useState<number>(0);  // Number of pages in the PDF
    const [page, setPage] = useState<number>(0);  // Current page, starting from 1
    const [url, setUrl] = useState<string>('');  // Loading state
    const [goToQuiz, setGoToQuiz] = useState<boolean>(false);
    //const [isLandscape, setIsLandscape] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);



    useListenToMessages((msg) => {
        if (msg.type == "go_to_slide") {
            setPage(msg.slideIndex);
        }
    });

    const setLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
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

    // Funtion to set Url to the desired one from firebase storage
    async function getUrl() {
        setUrl(await getDownloadURL(lectureDoc.uri));
    }

    // Load images when the component mounts
    useEffect(() => {
        getUrl();
        setLandscape();

        /*
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
        //Overlay quiz
        <>
            { }
            <RouteHeader title={"Lecture's Slides"} />
            <TView flexDirection={'row'} flex={1} style={{ width: "100%" }}>
                <TView mr={'lg'} flexDirection='column' style={{ width: isFullscreen ? "100%" : "60%" }}>
                    <Pdf
                        trustAllCerts={false}
                        source={{ uri: url }}
                        renderActivityIndicator={() =>
                            <ActivityIndicator size={'large'} />
                        }
                        enablePaging={true}
                        onLoadComplete={(totalPages) => setNumPages(totalPages)}
                        onPageChanged={(page) => {
                            setPage(page);
                            (page == 3) ? setGoToQuiz(true) : setGoToQuiz(false);
                        }}
                        onError={(error) => console.log(error)}
                        onPressLink={(link) => Linking.openURL(link)}
                        page={page}
                        horizontal
                        style={{ flex: 1, width: isFullscreen ? Dimensions.get('window').width : Dimensions.get('window').width * 0.6, height: Dimensions.get('window').height }} />

                    <TView flexDirection='row' justifyContent='space-between' >
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
                    console.log("Toogle events |||"); (lectureDoc.currentEvent) ? setLectureDoc(prevLectureDoc => ({
                        ...prevLectureDoc,      // Spread operator to keep other properties
                        currentEvent: undefined  // Only update currentEvent
                    })) : setLectureDoc(prevLectureDoc => ({
                        ...prevLectureDoc,      // Spread operator to keep other properties
                        currentEvent: quiz1  // Only update currentEvent
                    }));
                }} >
                    <TText> Toogle Quiz</TText>
                </FancyButton>
                <>{lectureDoc.currentEvent != undefined && (
                    <TView justifyContent='center' backgroundColor='base' style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1000 }}>
                        <TText mb={'md'} align='center' >This is the quiz</TText>
                        <FancyButton icon='bookmark-outline' onPress={() => setLectureDoc(prevLectureDoc => ({
                            ...prevLectureDoc,      // Spread operator to keep other properties
                            currentEvent: undefined  // Only update currentEvent
                        }))}><TText>Save Answer</TText></FancyButton>
                    </TView>
                )}</>

                <TView flexDirection='column' style={{ width: isFullscreen ? "0%" : "40%" }}>
                    {isFullscreen ?
                        <TView></TView> :
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

export default Slide;