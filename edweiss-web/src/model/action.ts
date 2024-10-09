import { FunctionFolder, FunctionOf } from './functions';

namespace Action {

    // MCQ: Multiple Choice Question
    // TF: True or False
    // "question" is the actual phrase that is asked to the student.

    export type MCQPropositionType = "text" | "image";
    export type MCQAnswerType = "text" | "image";

    export interface MCQ {
        question: string;
        image?: "image";
        propositions: MCQPropositionType[];
        answers: MCQAnswerType[];
    }

    export type TFQuestionType = "text";
    export type TFPropositionType = true | false;
    export type TFAnswerType = true | false;

    // we might not need the TF types.
    export interface TF {
        question: string;
        image?: "image";
        proposition: true | false;
        answer: true | false;
    }
    // could define a type "Exercise = MCQ | TF"
    export type Quiz = (MCQ | TF)[];

    export const Functions = FunctionFolder("action", {
        creation: FunctionFolder("creation", {
            createQuiz: FunctionOf<{ quiz: Action.Quiz; }, { id: string; }, "Empty_Quiz" | "Empty_exercise">("createQuiz"),
        })
    });

}
export default Action;