import { FunctionFolder, FunctionOf } from './functions';

namespace Quizzes {

    // MCQ: Multiple Choice Question
    // TF: True or False
    // "question" is the actual phrase that is asked to the student.

    export interface MCQProposition {
        description: string;
        imageUrl?: string;
        id: number;
    }

    export interface MCQ {
        question: string;
        imageUrl?: string;
        propositions: MCQProposition[]; // 2 to 8 propositions
        answersIndices: number[]; // the indices point to the correct propositions
    }
    export interface TF {
        question: string;
        image?: string;
        answer: true | false;
    }

    export type Exercise = MCQ | TF;

    export interface Quiz {
        name: string;
        deadline?: string;
        exercises: Exercise[];
    }

    export const Functions = FunctionFolder("action", {
        creation: FunctionFolder("creation", {
            createQuiz: FunctionOf<{ quiz: Quizzes.Quiz; }, { id: string; }, "empty_quiz" | "invalid_name">("createQuiz"),
        })
    });

}

export default Quizzes;