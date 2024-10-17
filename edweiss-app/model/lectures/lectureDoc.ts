import { Timestamp } from '@react-native-firebase/firestore';



namespace LectureDisplay {

    export type LectureEvents = "quiz";

    interface LectureEventBase {
        type: LectureEvents;
        done: boolean;
        pageNumber: number;
    }

    export interface QuizLectureEvent extends LectureEventBase {
        type: "quiz";
        // quizModel: Quizzes.Quiz;
    }

    export interface Lecture {
        uri: string;
        audioRecording: string[];
        currentEvent?: LectureEventBase;
        events: LectureEventBase[];
        availableToStudents: boolean;
        starts: Timestamp;
        ends: Timestamp;
    }
}

export default LectureDisplay;