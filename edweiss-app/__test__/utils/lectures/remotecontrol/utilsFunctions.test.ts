/**
 * @file utilsFunctions.test.tsx
 * @description Unit tests for utilsFunctions.tsx to ensure high line coverage
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import { handleLeft, handleMic, handleRight, updateSlideAudioRecording } from '@/utils/lectures/remotecontrol/utilsFunctions';
import { Vibration } from 'react-native';


// ------------------------------------------------------------
// -----------------  Mocking dependencies    -----------------
// ------------------------------------------------------------

// Firebase callfunction
jest.mock('@/config/firebase', () => ({
    callFunction: jest.fn(),
}));

// Phone vibration
jest.mock('react-native', () => ({
    Vibration: {
        vibrate: jest.fn(),
    },
}));


// ------------------------------------------------------------
// ------------   STRC Utils Functions Test suite   -----------
// ------------------------------------------------------------

describe('Utils Functions', () => {
    let mockSetPageToTranscribe: jest.Mock;
    let mockSetTalked: jest.Mock;
    let mockSetIsRecording: jest.Mock;
    let mockSetCurrentPage: jest.Mock;
    let mockStartRecording: jest.Mock;
    let mockStopRecording: jest.Mock;

    beforeEach(() => {
        mockSetPageToTranscribe = jest.fn();
        mockSetTalked = jest.fn();
        mockSetIsRecording = jest.fn();
        mockSetCurrentPage = jest.fn();
        mockStartRecording = jest.fn().mockResolvedValue(undefined);
        mockStopRecording = jest.fn().mockResolvedValue(undefined);
        jest.clearAllMocks();
    });

    describe('updateSlideAudioRecording', () => {
        it('should call callFunction and update states when talked is not empty', async () => {
            const talked = 'Sample transcription';
            const pageToTranscribe = 1;
            const courseName = 'course1';
            const lectureId = 'lecture1';
            const isRecording = true;
            const currentPage = 2;

            await updateSlideAudioRecording(
                talked,
                pageToTranscribe,
                courseName,
                lectureId,
                isRecording,
                currentPage,
                mockSetPageToTranscribe,
                mockSetTalked,
                mockStartRecording
            );

            expect(callFunction).toHaveBeenCalledWith(expect.anything(), {
                courseId: courseName,
                lectureId: lectureId,
                pageNumber: pageToTranscribe,
                transcription: talked,
            });
            expect(mockSetPageToTranscribe).toHaveBeenCalledWith(currentPage);
            expect(mockSetTalked).toHaveBeenCalledWith('');
            expect(mockStartRecording).toHaveBeenCalled();
        });

        it('should not call callFunction if talked is empty', async () => {
            await updateSlideAudioRecording(
                '',
                1,
                'course1',
                'lecture1',
                true,
                2,
                mockSetPageToTranscribe,
                mockSetTalked,
                mockStartRecording
            );

            expect(callFunction).not.toHaveBeenCalled();
            expect(mockSetPageToTranscribe).not.toHaveBeenCalled();
            expect(mockSetTalked).not.toHaveBeenCalled();
            expect(mockStartRecording).not.toHaveBeenCalled();
        });
    });

    describe('handleLeft', () => {
        it('should stop recording, call callFunction, and decrement page when on page > 1', async () => {
            const isRecording = true;
            const currentPage = 2;

            await handleLeft(
                isRecording,
                currentPage,
                mockSetIsRecording,
                mockSetCurrentPage,
                mockStopRecording
            );

            expect(mockStopRecording).toHaveBeenCalled();
            expect(mockSetIsRecording).toHaveBeenCalledWith(false);
            expect(callFunction).toHaveBeenCalledWith(expect.anything(), { page: currentPage - 1 });
            expect(mockSetCurrentPage).toHaveBeenCalledWith(currentPage - 1);
            expect(Vibration.vibrate).toHaveBeenCalledWith(100);
        });

        it('should not change page if currentPage is 1', async () => {
            const isRecording = true;
            const currentPage = 1;

            await handleLeft(
                isRecording,
                currentPage,
                mockSetIsRecording,
                mockSetCurrentPage,
                mockStopRecording
            );

            expect(mockStopRecording).not.toHaveBeenCalled();
            expect(callFunction).not.toHaveBeenCalled();
            expect(mockSetCurrentPage).not.toHaveBeenCalled();
            expect(Vibration.vibrate).toHaveBeenCalledWith(100);
        });
    });

    describe('handleRight', () => {
        it('should stop recording, call callFunction, and increment page if not on last page', async () => {
            const isRecording = true;
            const currentPage = 1;
            const totalPages = 3;

            await handleRight(
                isRecording,
                currentPage,
                totalPages,
                mockSetIsRecording,
                mockSetCurrentPage,
                mockStopRecording
            );

            expect(mockStopRecording).toHaveBeenCalled();
            expect(mockSetIsRecording).toHaveBeenCalledWith(false);
            expect(callFunction).toHaveBeenCalledWith(expect.anything(), { page: currentPage + 1 });
            expect(mockSetCurrentPage).toHaveBeenCalledWith(currentPage + 1);
            expect(Vibration.vibrate).toHaveBeenCalledWith(100);
        });

        it('should not change page if currentPage is last page', async () => {
            const isRecording = true;
            const currentPage = 3;
            const totalPages = 3;

            await handleRight(
                isRecording,
                currentPage,
                totalPages,
                mockSetIsRecording,
                mockSetCurrentPage,
                mockStopRecording
            );

            expect(mockStopRecording).not.toHaveBeenCalled();
            expect(callFunction).not.toHaveBeenCalled();
            expect(mockSetCurrentPage).not.toHaveBeenCalled();
            expect(Vibration.vibrate).toHaveBeenCalledWith(100);
        });
    });

    describe('handleMic', () => {
        it('should stop recording and update isRecording state when already recording', async () => {
            const isRecording = true;

            await handleMic(isRecording, mockSetIsRecording, mockStartRecording, mockStopRecording);

            expect(mockStopRecording).toHaveBeenCalled();
            expect(mockSetIsRecording).toHaveBeenCalledWith(false);
            expect(Vibration.vibrate).toHaveBeenCalledWith(100);
        });

        it('should start recording and update isRecording state when not recording', async () => {
            const isRecording = false;

            await handleMic(isRecording, mockSetIsRecording, mockStartRecording, mockStopRecording);

            expect(mockStartRecording).toHaveBeenCalled();
            expect(mockSetIsRecording).toHaveBeenCalledWith(true);
            expect(Vibration.vibrate).toHaveBeenCalledWith(100);
        });
    });
});
