/**
 * @file utilsFunctions.tsx
 * @description Utility functions for managing showtime lecture display
 * @author Adamm Alaoui
 */


// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import LectureDisplay from '@/model/lectures/lectureDoc';
import { langIconMap, langNameMap } from '../remotecontrol/utilsFunctions';

// type
import AvailableLangs = LectureDisplay.AvailableLangs;
type TranscriptLangMode = LectureDisplay.TranscriptLangMode;

// ------------------------------------------------------------
// ----------      Transcription Mode Selection      ----------
// ------------------------------------------------------------


export const transModeIconMap: Record<TranscriptLangMode, string> = {
    original: "📜",
    ...Object.fromEntries(
        (Object.keys(langIconMap) as AvailableLangs[]).map(lang => [lang, langIconMap[lang]])
    )
} as Record<TranscriptLangMode, string>;


export const transModeNameMap: Record<TranscriptLangMode, string> = {
    original: "Original",
    ...Object.fromEntries(
        (Object.keys(langNameMap) as AvailableLangs[]).map(lang => [lang, langNameMap[lang]])
    )
} as Record<TranscriptLangMode, string>;
