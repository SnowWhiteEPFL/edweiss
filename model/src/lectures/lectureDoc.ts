/**
 * @file lectureDoc.ts
 * @description Model for managing lecture documents and events in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FunctionFolder, FunctionOf, NoResult } from '../functions';
import Quizzes from '../quizzes';
import { Timestamp } from '../time';

// ------------------------------------------------------------
// -------------------   Lecture Namespace   ------------------
// ------------------------------------------------------------

namespace LectureDisplay {

	export type LectureEvents = "quiz";
	export type AvailableLangs = "english" | "french" | "spanish" | "italian" | "german" | "brazilian" | "arabic" | "chinese" | "vietanames" | "hindi";
	export type QuestionID = string & {};

	interface LectureEventBase {
		type: LectureEvents;
		done: boolean;
		pageNumber: number;
	}

	export interface QuizLectureEvent extends LectureEventBase {
		type: "quiz";
		quizModel: Quizzes.Quiz;
	}

	export interface Question {
		text: string,
		userID: string,
		username: string,
		anonym: boolean,
		likes: number,
		postedTime: Timestamp,
	}
	export interface Like {
		createdAt: Timestamp
	}

	export interface Lecture {
		pdfUri: string;
		nbOfPages: number;
		availableToStudents: boolean;
		audioTranscript: { [pageNumber: number]: string; };
	}

	export const Functions = FunctionFolder("lectures", {
		addAudioTranscript: FunctionOf<{ courseId: string, lectureId: string, pageNumber: number, transcription: string; }, {}, 'invalid_arg' | 'error_firebase' | 'successfully_added'>("addAudioTranscript"),
		createQuestion: FunctionOf<{ courseId: string, lectureId: string, question: string, anonym: boolean; }, { id: QuestionID; }, 'invalid_arg' | 'error_firebase' | 'empty_question' | 'user_not_found' | 'not_in_course'>("createQuestion"),
		likeQuestion: FunctionOf<{ id: QuestionID, courseId: string, lectureId: string, liked: boolean; }, NoResult, 'invalid_id'>("likeQuestion"),
	});
}

export default LectureDisplay;

