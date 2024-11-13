/**
 * @file addAudioTranscript.ts
 * @description Cloud function for adding audio transcripts to lecture documents in the edweiss app
 * @author Adamm Alaoui & Youssef Laraki
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import prompt from 'actions/ai';
import LectureDisplay from 'model/lectures/lectureDoc';
import { Course } from 'model/school/courses';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { assertNonEmptyStrings, assertPositiveNumber } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = LectureDisplay.Functions;

// Types
type Lecture = LectureDisplay.Lecture;

// ------------------------------------------------------------
// -----------  Add Audio Transcript Cloud Function   ---------
// ------------------------------------------------------------

export const addAudioTranscript = onAuthentifiedCall(Functions.addAudioTranscript, async (userId, args) => {
	assertNonEmptyStrings(args.courseId, args.lectureId, args.transcription);
	assertPositiveNumber(args.pageNumber);

	const course = await getRequiredDocument(CollectionOf<Course>(`courses`), args.courseId, fail("course_not_found"));
	const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseId}/lectures`), args.lectureId);

	if (lecture == undefined)
		return fail("firebase_error");

	if (typeof args.pageNumber !== 'number' || args.pageNumber < 1 || args.pageNumber > lecture.nbOfPages) {
		return fail('invalid_arg');
	}

	const pageKey = `audioTranscript.${args.pageNumber}`;

	const correctedTranscript = await prompt({
		task: `
			This is a "${course.name}" lecture at prestigious university EPFL.
			Description of the course: ${course.description}.

			You are an audio transcript correcting AI.
			Correct the following text captured by the microphone during the lecture.
		`,
		content: args.transcription,
		fallback: args.transcription
	});

	if (!lecture.audioTranscript || !lecture.audioTranscript[args.pageNumber]) {
		try {
			await lectureRef.update({
				[pageKey]: correctedTranscript
			});
		} catch (error) {
			return fail('firebase_error');
		}
	} else if (args.transcription) {
		try {
			await lectureRef.update({
				[pageKey]: lecture.audioTranscript[args.pageNumber] + correctedTranscript
			});
		} catch (error) {
			return fail('firebase_error');
		}
	}


	return ok('successfully_added');
});
