import { FunctionFolder, FunctionOf } from '../functions';
import Quizzes from '../quizzes';

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

    export interface Lecture {
        pdfUri: string;
        nbOfPages: number;
        availableToStudents: boolean;
        audioTranscript: { [pageNumber: number]: string; };
    }

    export const Function = FunctionFolder("lectures", {
        addAudioTranscript: FunctionOf<{ courseId: string, lectureId: string, pageNumber: number, transcription: string; }, {}, 'invalid_arg' | 'error_firebase' | 'successfully_added'>("addAudioTranscript"),
    });
}

export default LectureDisplay;
