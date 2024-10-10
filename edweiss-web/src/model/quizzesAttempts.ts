import { FunctionFolder, FunctionOf } from './functions';
import { CourseID } from './school/courses';

namespace QuizzesAttempts {
    export type MCQAnswersIndices = number[]; // unchecked options will not appear in the list in the first place
    export type TFAnswer = boolean | undefined;
    export type Answer = MCQAnswersIndices | TFAnswer;


    export interface QuizAttempt {
        userId: string;
        attempts: number;
        answers: Answer[];
    }

    export const Functions = FunctionFolder("action", {
        createQuizAttempt: FunctionOf<{ quizAttempt: QuizzesAttempts.QuizAttempt; courseId: CourseID; }, { id: string; }, "empty_quiz" | "invalid_name" | "not_authorized">("createQuizAttempt"),
    });

}
export default QuizzesAttempts;