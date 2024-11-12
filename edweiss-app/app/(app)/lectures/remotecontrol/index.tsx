/**
 * @file index.tsx
 * @description Main screen for displaying and managing the remote control for lectures in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TActivityIndicator from '@/components/core/TActivityIndicator';
import { AbstractRmtCrl } from '@/components/lectures/remotecontrol/abstractRmtCtl';
import { CollectionOf } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { handleLeft, handleMic, handleRight, updateSlideAudioRecording } from '@/utils/lectures/remotecontrol/utilsFunctions';
import Voice from '@react-native-voice/voice';
import { useLocalSearchParams } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { default as React, useEffect, useState } from 'react';


// Types
type Lecture = LectureDisplay.Lecture;


// ------------------------------------------------------------
// -------------------  Remote Control Screen  ----------------
// ------------------------------------------------------------

const RemoteControlScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;
    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined) || [];
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [pageToTranscribe, setPageToTranscribe] = useState<number>(1);
    const [talked, setTalked] = useState('');

    useEffect(() => { if (lectureDoc) { setPortrait(); } }, [lectureDoc]);
    useEffect(() => { updateSlideAudioRecording(talked, pageToTranscribe, courseName, lectureId, isRecording, currentPage, setPageToTranscribe, setTalked, startRecording); }, [talked]);


    if (!lectureDoc) return <TActivityIndicator size={40} />;
    const currentLecture = lectureDoc.data;
    const totalPages = currentLecture.nbOfPages;

    Voice.onSpeechStart = () => { };
    Voice.onSpeechEnd = () => { };
    Voice.onSpeechError = (e: any) => { console.log(e.error); };
    Voice.onSpeechResults = (res) => { setTalked(res.value ? res.value[0] : ""); };

    return (
        <>
            {<AbstractRmtCrl
                handleRight={() => handleRight(isRecording, currentPage, totalPages, setIsRecording, setCurrentPage, stopRecording)}
                handleLeft={() => handleLeft(isRecording, currentPage, setIsRecording, setCurrentPage, stopRecording)}
                handleMic={() => handleMic(isRecording, setIsRecording, startRecording, stopRecording)}
                isRecording={isRecording}
            />}
        </>
    );
};

export default RemoteControlScreen;



export const startRecording = async () => {
    console.log(' > start recording ...');
    try {
        await Voice.start('en-US');
    } catch (e: any) {
        console.log(e);
    }
};

export const stopRecording = async () => {
    console.log(' > stop recording ...');
    try {
        await Voice.stop();
    } catch (e: any) {
        console.log(e);
    }
};

// Portrait display for the screen
export const setPortrait = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
};