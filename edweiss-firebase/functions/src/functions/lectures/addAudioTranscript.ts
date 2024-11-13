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
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef, getRequiredDocument } from 'utils/firestore';
import { Predicate, assert } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';
import Functions = LectureDisplay.Functions;

// Types
type Lecture = LectureDisplay.Lecture;

// ------------------------------------------------------------
// -----------  Add Audio Transcript Cloud Function   ---------
// ------------------------------------------------------------

export const addAudioTranscript = onSanitizedCall(Functions.addAudioTranscript, {
	courseId: Predicate.isNonEmptyString,
	lectureId: Predicate.isNonEmptyString,
	transcription: Predicate.isNonEmptyString,
	pageNumber: Predicate.isStrictlyPositive,
}, async (userId, args) => {
	const course = await getRequiredDocument(CollectionOf<Course>(`courses`), args.courseId, fail("course_not_found"));
	const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseId}/lectures`), args.lectureId);

	if (lecture == undefined)
		return fail("firebase_error");

	assert(args.pageNumber > lecture.nbOfPages);

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
		await lectureRef.update({
			[pageKey]: correctedTranscript
		});
	} else if (args.transcription) {
		await lectureRef.update({
			[pageKey]: lecture.audioTranscript[args.pageNumber] + correctedTranscript
		});
	}

	return ok('successfully_added'); // Use OK. ("successfully_added" is a useless information)
});
