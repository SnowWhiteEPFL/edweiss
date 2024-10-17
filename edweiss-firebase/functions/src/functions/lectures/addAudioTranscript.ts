import LectureDisplay from 'model/lectures/lectureDoc';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf, getDocumentAndRef } from 'utils/firestore';
import { fail, ok } from 'utils/status';
import Function = LectureDisplay.Function;

type Lecture = LectureDisplay.Lecture;


export const addAudioTranscript = onAuthentifiedCall(Function.addAudioTranscript, async (userId, args) => {
    if (!args.courseId || !args.lectureId || !args.pageNumber || !args.transcription) {
        return fail('invalid_arg');
    }


    const [lecture, lectureRef] = await getDocumentAndRef(CollectionOf<Lecture>(`courses/${args.courseId}/lectures`), args.lectureId);

    if (lecture == undefined)
        return fail("firebase_error");

    if (typeof args.pageNumber !== 'number' || args.pageNumber < 1 || args.pageNumber > lecture.nbOfPages) {
        return fail('invalid_arg');
    }

    const pageKey = `audioTranscript.${args.pageNumber}`;

    if (!lecture.audioTranscript || !lecture.audioTranscript[args.pageNumber]) {
        try {
            await lectureRef.update({
                [pageKey]: args.transcription
            });
        } catch (error) {
            return fail('firebase_error');
        }
    } else if (args.transcription) {
        try {
            await lectureRef.update({
                [pageKey]: lecture.audioTranscript[args.pageNumber] + args.transcription
            });
        } catch (error) {
            return fail('firebase_error');
        }
    }


    return ok('successfully_added');
});
