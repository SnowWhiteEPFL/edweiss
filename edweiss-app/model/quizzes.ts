import { FunctionFolder, FunctionOf } from './functions';
import { Assignment, CourseID } from './school/courses';

namespace Quizzes {

    // MCQ: Multiple Choice Question
    // TF: True or False
    // "question" is the actual phrase that is asked to the student.

    export interface MCQProposition {
        description: string;
        imageUrl?: string;
        id: number;
        type: "MCQProposition";
    }

    export interface MCQ {
        question: string;
        imageURL?: string;
        propositions: MCQProposition[]; // 2 to 8 propositions
        answersIndices: number[]; // the indices point to the correct propositions
        type: "MCQ";
        numberOfAnswers: number;
    }
    export interface TF {
        question: string;
        imageURL?: string;
        answer: boolean;
        type: "TF";
    }

    export type Exercise = MCQ | TF;

    export interface Quiz extends Assignment {
        exercises: Exercise[];
        answers: QuizzesAttempts.Answer[];
        ended: boolean;
        showResultToStudents: boolean;
        // inherits:
        // name: string
        // type: AssignmentType = "quiz"|"submit"
        // dueDate: TimeStamp
    }

    export type Results = "correct" | "wrong" | "unselected" | "missing";

    export const Functions = FunctionFolder("action", {
        createQuiz: FunctionOf<{ quiz: Quizzes.Quiz; courseId: CourseID; }, { id: string; }, "empty_quiz" | "invalid_name" | "not_authorized">("createQuiz"),
        updateQuiz: FunctionOf<{ quiz: Quizzes.Quiz; courseId: CourseID; }, { id: string; }, "not_authorized">("updateQuiz")
    });

}

export default Quizzes;

export namespace QuizzesAttempts {
    // export type MCQAnswersIndices = number[]; // unchecked options will not appear in the list in the first place
    // export type TFAnswer = boolean | undefined;
    export interface MCQAnswersIndices {
        type: "MCQAnswersIndices",
        value: number[];
    }
    export interface TFAnswer {
        type: "TFAnswer",
        value: boolean | undefined;
    }
    export type Answer = MCQAnswersIndices | TFAnswer;

    export interface QuizAttempt {
        attempts: number;
        answers: Answer[];
    }

    export const Functions = FunctionFolder("action", {
        createQuizAttempt: FunctionOf<{ quizAttempt: QuizzesAttempts.QuizAttempt; courseId: CourseID; quizId: string; path: string; }, { id: string; }, "empty_quizAttempt" | "invalid_name" | "not_authorized">("createQuizAttempt"),
    });



}

// export namespace QuizzesResults {
//     // export type MCQAnswersIndices = number[]; // unchecked options will not appear in the list in the first place
//     // export type TFAnswer = boolean | undefined;
//     export interface MCQAnswersIndices {
//         type: "MCQAnswersIndices",
//         value: number[];
//     }
//     export interface TFAnswer {
//         type: "TFAnswer",
//         value: boolean | undefined;
//     }
//     export type Answer = MCQAnswersIndices | TFAnswer;

//     export interface QuizResults {
//         answers: Answer[];
//         quizName?: string;
//     }

//     export const Functions = FunctionFolder("action", {
//         createQuizResults: FunctionOf<{ quizResults: QuizzesResults.QuizResults; courseId: CourseID; quizId: string; }, { id: string; }, "empty_quizAttempt" | "invalid_name" | "not_authorized">("createQuizResults"),
//     });

// }
