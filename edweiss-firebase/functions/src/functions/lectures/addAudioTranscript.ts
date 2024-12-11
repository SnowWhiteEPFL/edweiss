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
import { fail, ok } from 'utils/status';
import Functions = LectureDisplay.Functions;

// Types
type Lecture = LectureDisplay.Lecture;
type AvailableLang = LectureDisplay.AvailableLangs;

// ------------------------------------------------------------
// -----------  Add Audio Transcript Cloud Function   ---------
// ------------------------------------------------------------

export const addAudioTranscript = onAuthentifiedCall(Functions.addAudioTranscript, async (userId, args) => {
	if (!args.courseId || !args.lectureId || !args.pageNumber || !args.transcription) {
		return fail('invalid_arg');
	}

	const course = await getRequiredDocument(CollectionOf<Course>(`courses`), args.courseId, fail("course_not_found"));

	const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseId}/lectures`), args.lectureId);

	if (lecture == undefined)
		return fail("error_firebase");

	if (typeof args.pageNumber !== 'number' || args.pageNumber < 1 || args.pageNumber > lecture.nbOfPages) {
		return fail('invalid_arg');
	}

	const pageKey = `audioTranscript.${args.pageNumber}`;

	const correctedTranscript = await prompt({
		task: `
			This is a "${course.name}" lecture at prestigious university EPFL.
			Description of the course: ${course.description}.

			You are an audio transcript correcting AI.
			Correct the following text captured by the microphone during the lecture. Keep the original language.
		`,
		content: args.transcription,
		fallback: args.transcription
	});

	// Translate the transcript 
	// Note the fail safe default of empty string
	const translatedTranscripts = ["", "", "", "", "", "", "", "", "", ""];
	for (const [i, targetLang] of (['english', 'french', 'german', 'spanish', 'italian', 'brazilian', 'arabic', 'chinese', 'vietnamese', 'hindi'] as AvailableLang[]).entries()) {
		const tradTranscript = await prompt({
			task: `
					You are an audio translation AI of a prestigious university.
					Translate the following in ${targetLang} even if the transcript is in multiple languages.
				`,
			content: correctedTranscript,
			fallback: ""
		});
		translatedTranscripts[i] = tradTranscript;
	}


	/**
	 * Create a new entry in the audio transcript
	 * Note: this code can be looped into a for loop, but for performance
	 * consideration I prefer relying on only one call to the update instead of 10 addiotional
	 */
	if (!lecture.audioTranscript || !lecture.audioTranscript[args.pageNumber]) {
		try {
			await lectureRef.update({
				[pageKey]: {
					0: correctedTranscript,
					1: translatedTranscripts[0],
					2: translatedTranscripts[1],
					3: translatedTranscripts[2],
					4: translatedTranscripts[3],
					5: translatedTranscripts[4],
					6: translatedTranscripts[5],
					7: translatedTranscripts[6],
					8: translatedTranscripts[7],
					9: translatedTranscripts[8],
					10: translatedTranscripts[9],
				}
			});
		} catch (error) {
			return fail('error_firebase');
		}

		/**
		 * Update an already existing entry in the audio transcript
		 * Note: this code can be looped into a for loop, however the 
		 * same argument as above applies in this scenario
		 */
	} else if (correctedTranscript) {
		try {
			await lectureRef.update({
				[`${pageKey}.0`]: lecture.audioTranscript[args.pageNumber][0] + " " + correctedTranscript,
				[`${pageKey}.1`]: lecture.audioTranscript[args.pageNumber][1] + " " + translatedTranscripts[0],
				[`${pageKey}.2`]: lecture.audioTranscript[args.pageNumber][2] + " " + translatedTranscripts[1],
				[`${pageKey}.3`]: lecture.audioTranscript[args.pageNumber][3] + " " + translatedTranscripts[2],
				[`${pageKey}.4`]: lecture.audioTranscript[args.pageNumber][4] + " " + translatedTranscripts[3],
				[`${pageKey}.5`]: lecture.audioTranscript[args.pageNumber][5] + " " + translatedTranscripts[4],
				[`${pageKey}.6`]: lecture.audioTranscript[args.pageNumber][6] + " " + translatedTranscripts[5],
				[`${pageKey}.7`]: lecture.audioTranscript[args.pageNumber][7] + " " + translatedTranscripts[6],
				[`${pageKey}.8`]: lecture.audioTranscript[args.pageNumber][8] + " " + translatedTranscripts[7],
				[`${pageKey}.9`]: lecture.audioTranscript[args.pageNumber][9] + " " + translatedTranscripts[8],
				[`${pageKey}.10`]: lecture.audioTranscript[args.pageNumber][10] + " " + translatedTranscripts[9],
			});
		} catch (error) {
			return fail('error_firebase');
		}
	}

	return ok('successfully_added');
});