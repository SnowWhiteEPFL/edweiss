import Quizzes from '../quizzes';
import { Timestamp } from '../time';

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
        start: Timestamp;
        ends: Timestamp;
        availableToStudents: boolean;
        nbOfPages: number;
    }
}

export default LectureDisplay;
