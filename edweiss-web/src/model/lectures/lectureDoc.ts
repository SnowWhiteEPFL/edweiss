/**
 * @file lectureDoc.ts
 * @description Model for managing lecture documents and events in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FunctionFolder, FunctionOf } from '../functions';
import Quizzes from '../quizzes';
import { Timestamp } from '../time';

// ------------------------------------------------------------
// -------------------   Lecture Namespace   ------------------
// ------------------------------------------------------------

namespace LectureDisplay {

	export type LectureEvents = "quiz";

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
		anonym: boolean,
		likes: number,
		postedTime: Timestamp,
	}

	export interface Lecture {
		pdfUri: string;
		nbOfPages: number;
		availableToStudents: boolean;
		audioTranscript: { [pageNumber: number]: string; };
	}

	export const Functions = FunctionFolder("lectures", {
		createQuestion: FunctionOf<{ courseId: string, lectureId: string, question: string; }, { id: string; }, 'invalid_arg' | 'error_firebase' | 'empty_question'>("createQuestion"),
		updateQuestion: FunctionOf<{ id: string, lectureId: string, likes: number; }, { id: string; }, 'invalid_id' | 'error_firebase' | 'empty_question'>("updateQuestion"),
		addAudioTranscript: FunctionOf<{ courseId: string, lectureId: string, pageNumber: number, transcription: string; }, 'successfully_added', 'invalid_arg' | 'error_firebase' | 'course_not_found'>("addAudioTranscript"),
	});
}

export default LectureDisplay;

