import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { CollectionOf, getDownloadURL } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useListenToMessages from '@/hooks/useListenToMessages';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking } from 'react-native';
import Pdf from 'react-native-pdf';

type Lecture = LectureDisplay.Lecture;

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
    const [numPages, setNumPages] = useState<number>(0);  // Total number of pages in the PDF
    const [page, setPage] = useState<number>(0);  // Current page, starting from 1
    const [uri, setUri] = useState<string>('');  // Url state
    //const [isLandscape, setIsLandscape] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false); // FullScreen display of pdf toggle

    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);

    // Load images when the component mounts
    useEffect(() => {
        if (lectureDoc) {
            getUri();
            setLandscape();
        }

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

    }, [lectureDoc]);

    if (!lectureDoc) return <TActivityIndicator size={40} />;
    const currentLecture = lectureDoc.data;



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
        setUri(await getDownloadURL(currentLecture.pdfUri));
        console.log(uri);
    }


    return (
        //Screen Display on landscape mode
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />


            <TView flexDirection={'row'} flex={1} style={{ width: "100%" }}>


                <TView mr={'lg'} flexDirection='column' style={{ width: isFullscreen ? "100%" : "60%" }}>
                    <Pdf
                        trustAllCerts={false}
                        source={{ uri: uri }}
                        renderActivityIndicator={() =>
                            <ActivityIndicator size={'large'} />
                        }
                        enablePaging={true}
                        onLoadComplete={(totalPages) => setNumPages(totalPages)}
                        onError={(error) => console.log(error)}
                        onPressLink={(link) => Linking.openURL(link)}
                        page={page}
                        horizontal
                        style={{ flex: 1, width: isFullscreen ? Dimensions.get('window').width : Dimensions.get('window').width * 0.6, height: Dimensions.get('window').height }} />

                    <TView flexDirection='row' justifyContent='space-between' >
                        {/* Buttons for page change and fullScreen toggle */}

                        <TView flexDirection='row' justifyContent='space-between' pr={'sm'} pl={'sm'}>
                            <TTouchableOpacity backgroundColor='transparent' onPress={pageBack} pr={'md'}>
                                <Icon size={'xl'} name='arrow-back-circle-outline' color='text'></Icon>
                            </TTouchableOpacity>

                            <TTouchableOpacity backgroundColor='transparent' onPress={pageForward} pl={'md'}>
                                <Icon size={'xl'} name='arrow-forward-circle-outline' color='text'></Icon>
                            </TTouchableOpacity>

                        </TView>

                        <TTouchableOpacity backgroundColor='transparent' onPress={() => setIsFullscreen(!isFullscreen)}>
                            <Icon size={'xl'} name={isFullscreen ? 'contract-outline' : 'expand-outline'} dark='text'></Icon>
                        </TTouchableOpacity>
                    </TView>
                </TView >

                <TView flexDirection='column' style={{ width: isFullscreen ? "0%" : "40%" }}>
                    {isFullscreen ?
                        <TView></TView> : // Speech to Text translation display and question forum display
                        <>
                            <TScrollView b={'sm'} m={'lg'}>
                                <TText> some text</TText>
                            </TScrollView>
                            <TScrollView flex={0.5} b={'xs'} mb={'md'}>
                                <FancyTextInput label='Ask your questions' mt={'xl'} icon='chatbubbles-outline' />
                            </TScrollView>
                        </>}
                </TView>
            </TView >
        </>
    );
};

export default LectureScreen;