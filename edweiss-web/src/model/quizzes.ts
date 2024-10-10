import { FunctionFolder, FunctionOf } from './functions';
import { CourseID } from './school/courses';

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
    }
    export interface TF {
        question: string;
        imageURL?: string;
        answer: boolean;
        type: "TF";
    }

    export type Exercise = MCQ | TF;

    export interface Quiz {
        name: string;
        deadline?: string;
        exercises: Exercise[];
    }

    export const Functions = FunctionFolder("action", {
        createQuiz: FunctionOf<{ quiz: Quizzes.Quiz; courseId: CourseID; }, { id: string; }, "empty_quiz" | "invalid_name" | "not_authorized">("createQuiz"),
    });

}

export default Quizzes;