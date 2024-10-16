import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { callFunction, CollectionOf } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { FCMCommunication } from '@/model/users';
import Voice from '@react-native-voice/voice';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { Vibration } from 'react-native';


import Functions = FCMCommunication.Functions;

type Lecture = LectureDisplay.Lecture;

const RemoteControlScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;
    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [talked, setTalked] = useState('');


    useEffect(() => {
        if (lectureDoc) {
            setPortrait();
        }
    }, [lectureDoc]);

    if (!lectureDoc) return <TActivityIndicator size={40} />;
    const currentLecture = lectureDoc.data;
    const totalPages = currentLecture.nbOfPages;




    Voice.onSpeechStart = () => { setIsRecording(true); };
    Voice.onSpeechEnd = () => { setIsRecording(false); };

    Voice.onSpeechError = (e: any) => { console.log(e.error); };
    Voice.onSpeechResults = (res) => { { setTalked(res.value ? res.value[0] : ""); updateSlideAudioRecording(); } };

    const startRecording = async () => {
        try {
            await Voice.start('en-US');
        } catch (e: any) {
            console.log(e);
        }
    };

    const stopRecoding = async () => {
        try {
            await Voice.stop();
        } catch (e: any) {
            console.log(e);
        }
    };


    function updateSlideAudioRecording() {
        console.log("talked: ", talked);
    }

    function handleLeft() {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
            try {
                callFunction(Functions.sendFCMPage, { page: currentPage });
            } catch (error) {
                console.error("Error sending FCM page:", error);
            }
        }
        console.log("left pressed");
        Vibration.vibrate(100);
    }

    function handleRight() {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
            try {
                callFunction(Functions.sendFCMPage, { page: currentPage });
            } catch (error) {
                console.error("Error sending FCM page:", error);
            }
        }
        console.log("right pressed");
        Vibration.vibrate(100);
    }

    function handleMic() {
        if (isRecording) {
            stopRecoding();
        } else {
            startRecording();
        }

        Vibration.vibrate(100);
        console.log(talked);
        console.log("mic pressed");
        setIsRecording(!isRecording);
    }

    // Portrait display for the screen
    const setPortrait = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    return (
        //Screen Display on landscape mode
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />


            <TView mt={100} mb={100} justifyContent='center' alignItems='center'>
                <TText size={25} mb={'md'}> The ShowTime!</TText>
                <TText size={35} > Remote Control</TText>
                {isRecording ? (
                    <TText mt={15} size={15} color='red'> •   recording </TText>
                ) : (
                    <TText mt={15} size={15} color='green'> tap to record audio </TText>
                )}
            </TView>

            {/* DELETE THIS */}
            <TText>{talked}</TText>
            {/* DELETE THIS */}

            <TView mr={20} ml={20} flexDirection='row' justifyContent='space-between'>
                <TTouchableOpacity backgroundColor='blue' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleLeft}>
                    <Icon size={70} name='chevron-back-outline' color='base'></Icon>
                </TTouchableOpacity>
                <TTouchableOpacity backgroundColor='blue' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleRight}>
                    <Icon size={70} name='chevron-forward-outline' color='base'></Icon>
                </TTouchableOpacity>
            </TView>


            <TView mt={70} mb={30} justifyContent='center' alignItems='center'>
                <TTouchableOpacity backgroundColor={isRecording ? 'red' : 'base'} borderColor={isRecording ? 'base' : 'red'} b={5} p={10} radius={1000} onPress={handleMic}>
                    <Icon size={70} name='mic-outline' color={isRecording ? 'base' : 'red'}></Icon>
                </TTouchableOpacity>
            </TView>

        </>
    );
};

export default RemoteControlScreen;