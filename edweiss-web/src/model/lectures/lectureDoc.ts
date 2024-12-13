/**
 * @file lectureDoc.ts
 * @description Model for managing lecture documents and events in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FunctionFolder, FunctionOf, NoResult } from '../functions';
import { LectureQuizzes } from '../quizzes';
import { Timestamp } from '../time';

// ------------------------------------------------------------
// -------------------   Lecture Namespace   ------------------
// ------------------------------------------------------------

namespace LectureDisplay {


	export type LectureEvent = "quiz" | "question" | "invalid";
	export type AvailableLangs = "english" | "french" | "spanish" | "italian" | "german" | "brazilian" | "arabic" | "chinese" | "vietanames" | "hindi";
	export type QuestionID = string & {};
	export type TranscriptLangMode = 'original' | AvailableLangs;

	export type MultiLangTranscript = {
		[langNumber: number]: string;
	};

	export interface LectureEventBase {
		type: LectureEvent;
		done: boolean;
		id: string;
		pageNumber: number;
	}

	export interface QuizLectureEvent extends LectureEventBase {
		type: "quiz";
		pageNumber: number;
		quizModel: LectureQuizzes.LectureQuiz;
	}


	export interface QuestionLectureEvent extends LectureEventBase {
		type: "question";
	}

	export interface Question {
		text: string,
		userID: string,
		username: string,
		anonym: boolean,
		likes: number,
		postedTime: Timestamp,
		answered: boolean,
	}
	export interface Like {
		createdAt: Timestamp
	}

	export interface Lecture {
		pdfUri: string;
		nbOfPages: number;
		availableToStudents: boolean;
		audioTranscript: { [pageNumber: number]: MultiLangTranscript; };
		event?: LectureEventBase;
	}

	export const Functions = FunctionFolder("lectures", {
		addAudioTranscript: FunctionOf<{ courseId: string, lectureId: string, pageNumber: number, transcription: string; }, {}, 'invalid_arg' | 'error_firebase' | 'successfully_added'>("addAudioTranscript"),
		markQuestionAsAnswered: FunctionOf<{ id: string, courseId: string, lectureId: string, answered: boolean }, { id: string; }, 'invalid_id' | 'error_firebase' | 'empty_question'>("markQuestionAsAnswered"),
		broadcastQuestion: FunctionOf<{ id: string, courseId: string, lectureId: string }, { id: string; }, 'invalid_id' | 'error_firebase' | 'empty_question'>("broadcastQuestion"),
		clearQuestionEvent: FunctionOf<{ id: string, courseId: string, lectureId: string }, { id: string; }, 'invalid_id' | 'error_firebase' | 'empty_question'>("clearQuestionEvent"),
		createQuestion: FunctionOf<{ courseId: string, lectureId: string, question: string, anonym: boolean; }, { id: QuestionID; }, 'invalid_arg' | 'error_firebase' | 'empty_question' | 'user_not_found' | 'not_in_course'>("createQuestion"),
		likeQuestion: FunctionOf<{ id: QuestionID, courseId: string, lectureId: string, liked: boolean; }, NoResult, 'invalid_id'>("likeQuestion"),
	});
}

export default LectureDisplay;

