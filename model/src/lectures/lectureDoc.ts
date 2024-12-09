/**
 * @file lectureDoc.ts
 * @description Model for managing lecture documents and events in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FunctionFolder, FunctionOf } from '../functions';
import { LectureQuizzes } from '../quizzes';
import { Timestamp } from '../time';

// ------------------------------------------------------------
// -------------------   Lecture Namespace   ------------------
// ------------------------------------------------------------

namespace LectureDisplay {

	export type LectureEventType = "quiz";
	export type AvailableLangs = "english" | "french" | "spanish" | "italian" | "german" | "brazilian" | "arabic" | "chinese" | "vietanames" | "hindi";
	export type TranscriptLangMode = 'original' | AvailableLangs;

	export type MultiLangTranscript = {
		[langNumber: number]: string;
	};

	interface LectureEventBase {
		type: LectureEventType;
		done: boolean;
		pageNumber: number;
	}

	export interface QuizLectureEvent extends LectureEventBase {
		type: "quiz";
		quizModel: LectureQuizzes.LectureQuiz;
	}

	export type LectureEvent = QuizLectureEvent
	export interface Question {
		text: string,
		userID: string,
		username: string,
		anonym: boolean,
		likes: number,
		postedTime: Timestamp,
	}

	export interface Lecture {
		pdfUri: string;
		nbOfPages: number;
		availableToStudents: boolean;
		audioTranscript: { [pageNumber: number]: MultiLangTranscript; };
	}

	export const Functions = FunctionFolder("lectures", {
		addAudioTranscript: FunctionOf<{ courseId: string, lectureId: string, pageNumber: number, transcription: string; }, {}, 'invalid_arg' | 'error_firebase' | 'successfully_added'>("addAudioTranscript"),
		createQuestion: FunctionOf<{ courseId: string, lectureId: string, question: string, anonym: boolean; }, { id: string; }, 'invalid_arg' | 'error_firebase' | 'empty_question' | 'user_not_found' | 'not_in_course'>("createQuestion"),
		likeQuestion: FunctionOf<{ id: string, courseId: string, lectureId: string, likes: number; }, { id: string; }, 'invalid_id' | 'error_firebase' | 'empty_question'>("likeQuestion"),
	});
}

export default LectureDisplay;

