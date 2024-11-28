/**
 * @file utilsFunctions.tsx
 * @description Utility functions for managing to showtime remote control
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { FCMCommunication } from '@/model/users';
import { Vibration } from 'react-native';

// types
import AvailableLangs = LectureDisplay.AvailableLangs;


// ------------------------------------------------------------
// --------------- Update Slide Audio Recording ---------------
// ------------------------------------------------------------

export const updateSlideAudioRecording = function (
    talked: string,
    pageToTranscribe: number,
    courseName: string,
    lectureId: string,
    isRecording: boolean,
    currentPage: number,
    setPageToTranscribe: React.Dispatch<React.SetStateAction<number>>,
    setTalked: React.Dispatch<React.SetStateAction<string>>,
    startRecording: () => Promise<void>
) {
    console.log(`HI THERE in update in here:'${talked}' @page ${pageToTranscribe}`);
    if (talked && talked.length > 0) {
        try {
            callFunction(LectureDisplay.Functions.addAudioTranscript, {
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


// ------------------------------------------------------------
// ----------------    Previous page handler    ---------------
// ------------------------------------------------------------

export const handleLeft = function (
    isRecording: boolean,
    currentPage: number,
    setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    stopRecording: () => Promise<void>
) {
    const wasRecording = isRecording;
    if (currentPage > 1) {

        // Catch the slide recording
        if (wasRecording) {
            stopRecording();
            setIsRecording(false);
        }

        // Update the page
        try {
            callFunction(FCMCommunication.Functions.sendFCMPage, { page: currentPage - 1 });
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

// ------------------------------------------------------------
// -----------------    Next page handler     -----------------
// ------------------------------------------------------------


export const handleRight = function (
    isRecording: boolean,
    currentPage: number,
    totalPages: number,
    setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
    stopRecording: () => Promise<void>
) {
    const wasRecording = isRecording;
    if (currentPage < totalPages) {

        // Catch the slide recording
        if (wasRecording) {
            stopRecording();
            setIsRecording(false);
        }

        // Update the page
        try {
            callFunction(FCMCommunication.Functions.sendFCMPage, { page: currentPage + 1 });
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


// ------------------------------------------------------------
// -----------------    Handle Microphone     -----------------
// ------------------------------------------------------------

export const handleMic = function (
    isRecording: boolean,
    setIsRecording: React.Dispatch<React.SetStateAction<boolean>>,
    startRecording: () => Promise<void>,
    stopRecording: () => Promise<void>
) {
    if (isRecording) {
        stopRecording();
        setIsRecording(false);
    } else {
        startRecording();
        setIsRecording(true);
    }

    Vibration.vibrate(100);
    setIsRecording(!isRecording);
}


// ------------------------------------------------------------
// -----------------    Language Selection    -----------------
// ------------------------------------------------------------

export const langIconMap: Record<AvailableLangs, string> = {
    "english": "🇺🇸",
    "french": "🇫🇷",
    "spanish": "🇪🇸",
    "italian": "🇮🇹",
    "german": "🇩🇪",
    "brazilian": "🇧🇷",
    "arabic": "🇸🇦",
    "chinese": "🇨🇳",
    "vietanames": "🇻🇳"
};

export const langNameMap: Record<AvailableLangs, string> = {
    "english": "English",
    "french": "Français",
    "spanish": "Español",
    "italian": "Italiano",
    "german": "Deutsch",
    "brazilian": "Português",
    "arabic": "العربية",
    "chinese": "中文",
    "vietanames": "Tiếng Việt"
};