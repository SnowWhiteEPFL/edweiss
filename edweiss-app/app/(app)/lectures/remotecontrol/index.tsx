/**
 * @file index.tsx
 * @description Main screen for displaying and managing the remote control for lectures in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { callFunction, CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { FCMCommunication } from '@/model/users';
import Voice from '@react-native-voice/voice';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { Vibration } from 'react-native';

// Types
type Lecture = LectureDisplay.Lecture;


// ------------------------------------------------------------
// -------------------  Remote Control Screen  ----------------
// ------------------------------------------------------------

const RemoteControlScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;
    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined); // Maybe put  a doc instead
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageToTranscribe, setPageToTranscribe] = useState<number>(1);
    const [talked, setTalked] = useState('');

    useEffect(() => {
        if (lectureDoc) {
            setPortrait();
        }
    }, [lectureDoc]);

    useEffect(() => {
        updateSlideAudioRecording();
    }, [talked]);


    if (!lectureDoc) return <TActivityIndicator size={40} />;
    const currentLecture = lectureDoc.data;
    const totalPages = currentLecture.nbOfPages;

    Voice.onSpeechStart = () => { };
    Voice.onSpeechEnd = () => { };


    Voice.onSpeechError = (e: any) => { console.log(e.error); };
    Voice.onSpeechResults = (res) => { { setTalked(res.value ? res.value[0] : ""); } };

    const startRecording = async () => {
        console.log(' > start recording ...');
        try {
            await Voice.start('en-US');
        } catch (e: any) {
            console.log(e);
        }
    };

    const stopRecoding = async () => {
        console.log(' > stop recording ...');
        try {
            await Voice.stop();
        } catch (e: any) {
            console.log(e);
        }
    };


    async function updateSlideAudioRecording() {
        console.log(`HI THERE in update in here:'${talked}' @page ${pageToTranscribe}`);
        if (talked && talked.length > 0) {
            try {
                await callFunction(LectureDisplay.Functions.addAudioTranscript, {
                    courseId: courseName,
                    lectureId: lectureId,
                    pageNumber: pageToTranscribe,
                    transcription: talked
                });
            } catch (error) {
                console.error("Error adding audio transcript:", error);
            }

            setPageToTranscribe(currentPage);
            setTalked('');
            if (isRecording) {
                startRecording();
            }
        }
    }

    // Previous page handler
    async function handleLeft() {
        const wasRecording = isRecording;
        if (currentPage > 1) {

            // Catch the slide recording
            if (wasRecording) {
                stopRecoding();
                setIsRecording(false);
            }

            // Update the page
            try {
                await callFunction(FCMCommunication.Functions.sendFCMPage, { page: currentPage - 1 });
            } catch (error) {
                console.error("Error sending FCM page:", error);
            }

            // Start new recording for previous slide
            if (wasRecording) setIsRecording(true);

            // On sucess update hook
            setCurrentPage(currentPage - 1);
        }
        Vibration.vibrate(100);
    }

    // Next page handler
    async function handleRight() {
        const wasRecording = isRecording;
        if (currentPage < totalPages) {

            // Catch the slide recording
            if (wasRecording) {
                stopRecoding();
                setIsRecording(false);
            }

            // Update the page
            try {
                await callFunction(FCMCommunication.Functions.sendFCMPage, { page: currentPage + 1 });
            } catch (error) {
                console.error("Error sending FCM page:", error);
            }

            // Start new recording for next slide
            if (wasRecording) setIsRecording(true);

            // On sucess update hook
            setCurrentPage(currentPage + 1);

        }
        Vibration.vibrate(100);
    }

    function handleMic() {
        if (isRecording) {
            stopRecoding();
            setIsRecording(false);
        } else {
            startRecording();
            setIsRecording(true);
        }

        Vibration.vibrate(100);
        setIsRecording(!isRecording);
    }

    // Portrait display for the screen
    const setPortrait = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    return (
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />


            <TView mt={100} mb={100} justifyContent='center' alignItems='center'>
                <TText size={25} mb={'md'}> {t(`showtime:showtime_title`)}</TText>
                <TText size={35} >{t(`showtime:rmt_cntl_title`)}</TText>
                {isRecording ? (
                    <TText mt={15} size={15} color='red'> {t(`showtime:recording_start`)} </TText>
                ) : (
                    <TText mt={15} size={15} color='green'> {t(`showtime:tap_to_start_recording`)} </TText>
                )}
            </TView>

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