/**
 * @file utilsFunctions.test.tsx
 * @description Unit tests for utilsFunctions.tsx to ensure correct
 *              utils functionality and corner cases handling.
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { callFunction } from '@/config/firebase';
import { handleGoTo, handleLeft, handleMic, handleRight, langCodeMap, langIconMap, langNameMap, updateSlideAudioRecording } from '@/utils/lectures/remotecontrol/utilsFunctions';
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

    describe('Language Maps', () => {
        describe('langIconMap', () => {
            it('should return correct icon for each language', () => {
                expect(langIconMap.english).toBe('🇬🇧');
                expect(langIconMap.french).toBe('🇫🇷');
                expect(langIconMap.spanish).toBe('🇪🇸');
                expect(langIconMap.italian).toBe('🇮🇹');
                expect(langIconMap.german).toBe('🇩🇪');
                expect(langIconMap.brazilian).toBe('🇧🇷');
                expect(langIconMap.arabic).toBe('🇸🇦');
                expect(langIconMap.chinese).toBe('🇨🇳');
                expect(langIconMap.vietanames).toBe('🇻🇳');
                expect(langIconMap.hindi).toBe('🇮🇳');
            });
        });

        describe('langNameMap', () => {
            it('should return correct name for each language', () => {
                expect(langNameMap.english).toBe('English');
                expect(langNameMap.french).toBe('Français');
                expect(langNameMap.spanish).toBe('Español');
                expect(langNameMap.italian).toBe('Italiano');
                expect(langNameMap.german).toBe('Deutsch');
                expect(langNameMap.brazilian).toBe('Português');
                expect(langNameMap.arabic).toBe('العربية');
                expect(langNameMap.chinese).toBe('中文');
                expect(langNameMap.vietanames).toBe('Tiếng Việt');
                expect(langNameMap.hindi).toBe('हिन्दी');
            });
        });

        describe('langCodeMap', () => {
            it('should return correct code for each language', () => {
                expect(langCodeMap.english).toBe('en-US');
                expect(langCodeMap.french).toBe('fr-FR');
                expect(langCodeMap.spanish).toBe('es-ES');
                expect(langCodeMap.italian).toBe('it-IT');
                expect(langCodeMap.german).toBe('de-DE');
                expect(langCodeMap.brazilian).toBe('pt-BR');
                expect(langCodeMap.arabic).toBe('ar-SA');
                expect(langCodeMap.chinese).toBe('zh-CN');
                expect(langCodeMap.vietanames).toBe('vi-VN');
                expect(langCodeMap.hindi).toBe('hi-IN');
            });
        });
    });
});


describe('handleGoTo Test Suites', () => {
    let mockSetCurrentPage: jest.Mock;

    beforeEach(() => {
        mockSetCurrentPage = jest.fn();
        jest.clearAllMocks();
    });

    it('should call callFunction, log success message, and update page when targetPage is less than totalPages', async () => {
        const targetPage = 2;
        const totalPages = 3;

        await handleGoTo(targetPage, totalPages, mockSetCurrentPage);

        expect(callFunction).toHaveBeenCalled();
        expect(mockSetCurrentPage).toHaveBeenCalledWith(targetPage);
        expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    });

    it('should log error message if callFunction throws an error', async () => {
        const targetPage = 2;
        const totalPages = 3;
        const error = new Error('Test error');
        (callFunction as jest.Mock).mockImplementationOnce(() => {
            throw error;
        });

        await handleGoTo(targetPage, totalPages, mockSetCurrentPage);

        expect(callFunction).toHaveBeenCalled();
        expect(mockSetCurrentPage).toHaveBeenCalledWith(targetPage);
        expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    });

    it('should not call callFunction or update page when targetPage is not less than totalPages', async () => {
        const targetPage = 3;
        const totalPages = 3;

        await handleGoTo(targetPage, totalPages, mockSetCurrentPage);

        expect(callFunction).not.toHaveBeenCalled();
        expect(mockSetCurrentPage).not.toHaveBeenCalled();
        expect(Vibration.vibrate).toHaveBeenCalledWith(100);
    });
});

