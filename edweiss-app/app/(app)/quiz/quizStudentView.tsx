
import TActivityIndicator from '@/components/core/TActivityIndicator';
import { callFunction, CollectionOf } from '@/config/firebase';
import { useDoc, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';

import TSafeArea from '@/components/core/containers/TSafeArea';
import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { MCQDisplay, MCQResultDisplay, TFDisplay, TFResultDisplay } from '@/components/quiz/QuizComponents';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';

const QuizStudentViewPage: ApplicationRoute = () => {

    const { quizId, courseId } = useLocalSearchParams();
    const pathToAssignments = "courses/" + courseId + "/assignments"
    const pathToAttempts = pathToAssignments + "/" + quizId + "/attempts";
    const { uid } = useAuth();
    const [quiz, loading] = usePrefetchedDynamicDoc(CollectionOf<Quizzes.Quiz>(pathToAssignments), quizId as string, undefined);
    const previousAttempt = useDoc(CollectionOf<QuizzesAttempts.QuizAttempt>(pathToAttempts), uid);
    const [studentAnswers, setStudentAnswers] = useState<QuizzesAttempts.Answer[]>([]);

    useEffect(() => {

        if (!quiz?.data?.exercises)
            return;

        const defaultAnswers = quiz.data.exercises.map(ex => {
            if (ex.type == "MCQ") {
                const MCQAnswer: QuizzesAttempts.MCQAnswersIndices = {
                    type: "MCQAnswersIndices",
                    value: []
                };
                return MCQAnswer;
            }
            else {
                const TFAnswer: QuizzesAttempts.TFAnswer = {
                    type: "TFAnswer",
                    value: undefined
                };
                return TFAnswer;
            }
        });
        setStudentAnswers(defaultAnswers);
    }, [quiz]);

    const onUpdate = useCallback((newAnswer: number[] | boolean | undefined, exId: number) => {
        setStudentAnswers((oldStudentAnswers) => {
            const newStudentAnswers = [...oldStudentAnswers];
            newStudentAnswers[exId].value = newAnswer;
            return newStudentAnswers;
        });
    }, []);

    if (typeof quizId != 'string') {
        return <Redirect href={'/'} />;
    }

    if (quiz == undefined) {
        return <TActivityIndicator testID='undefined-quiz-loading' />;
    }

    const exercises = quiz.data.exercises;

    async function send() {
        sendWith(previousAttempt?.data, studentAnswers, courseId as string, pathToAttempts, quiz?.id)
    }

    if (quiz.data.showResultToStudents && previousAttempt != undefined) {
        return (
            <>
                <RouteHeader title={quiz.data.name} />
                <QuizResultDisplay key={quiz.id + "result"} studentAnswers={previousAttempt.data.answers} exercises={exercises} results={quiz.data.answers} testId='quiz-result-display'></QuizResultDisplay>
            </>);
    }
    else if (!quiz.data.showResultToStudents) {
        return (<>
            <RouteHeader title={quiz.data.name} />
            <QuizDisplay key={quiz.id + "display"} studentAnswers={studentAnswers} exercises={exercises} onUpdate={onUpdate} send={send} testId='quiz-display'></QuizDisplay>
        </>);
    }
    else {
        return (<TActivityIndicator />);
    }

};

export default QuizStudentViewPage;

export const QuizDisplay: ReactComponent<{ studentAnswers: QuizzesAttempts.Answer[], exercises: Quizzes.Exercise[], onUpdate: (answer: number[] | boolean | undefined, id: number) => void, send: () => void, testId: string }> = ({ studentAnswers, exercises, onUpdate, send, testId }) => {
    return ( // for now, returns a scroll view instead of the "tiktok" format

        <TSafeArea>
            <TScrollView testID={testId}>
                <TText>
                    {/*JSON.stringify(studentAnswers.map(a => a.value))*/}
                </TText>
                <For each={exercises} key={"QuizDisplay"}>
                    {
                        (thisExercise, index) => {
                            if (thisExercise.type == "MCQ" && studentAnswers[index] != undefined) {

                                return (<MCQDisplay key={thisExercise.question + "display"} exercise={thisExercise} selectedIds={studentAnswers[index].value as number[]} onUpdate={onUpdate} exId={index} />);
                            }
                            else if (thisExercise.type == "TF" && studentAnswers[index] != undefined) { // if type == "TF"
                                return (<TFDisplay key={thisExercise.question + "display"} exercise={thisExercise} selected={studentAnswers[index].value as boolean | undefined} onUpdate={onUpdate} exId={index} />);
                            } else {
                                return (<TActivityIndicator />);
                            }
                        }
                    }
                </For>

                <FancyButton
                    mt={"md"} mb={"md"}
                    onPress={() => {
                        send();
                        router.back();
                    }}
                    icon='save-sharp'
                    testID='submit'>
                    Submit and exit
                </FancyButton>

            </TScrollView>
        </TSafeArea >

    );
};

export const QuizResultDisplay: ReactComponent<{ studentAnswers: QuizzesAttempts.Answer[], results: QuizzesAttempts.Answer[], exercises: Quizzes.Exercise[], testId: string }> = ({ studentAnswers, results, exercises, testId }) => {

    let score = 0;
    for (let index = 0; index < results.length; index++) {
        if (studentAnswers[index].type == 'TFAnswer') {
            if (studentAnswers[index].value == results[index].value) {
                score++;
            }
        }
        else if (studentAnswers[index].type == 'MCQAnswersIndices') {
            if (arraysEqual(studentAnswers[index].value as number[], results[index].value as number[])) {
                score++;
            }
        }
    }

    return ( // for now, returns a scroll view instead of the "tiktok" format
        <>
            <RouteHeader disabled />
            <TSafeArea>
                <TScrollView testID={testId}>

                    <TView p={'xl'}>
                        <TText size={'xl'}>
                            Your score : {score}/{exercises.length}
                        </TText>
                    </TView>

                    <For each={exercises} key={"QuizResultDisplay"}>
                        {
                            (thisExercise, index) => {
                                if (thisExercise.type == "MCQ" && studentAnswers[index] != undefined) {

                                    return (<MCQResultDisplay key={thisExercise.question + "result"} exercise={thisExercise} selectedIds={studentAnswers[index].value as number[]} results={results[index].value as number[]} />);
                                }
                                else if (thisExercise.type == "TF" && studentAnswers[index] != undefined) { // if type == "TF"
                                    return (<TFResultDisplay key={thisExercise.question + "result"} exercise={thisExercise} selected={studentAnswers[index].value as boolean | undefined} result={results[index].value as boolean} />);
                                } else {
                                    return (<TActivityIndicator />);
                                }
                            }
                        }
                    </For>

                    <FancyButton
                        mt={"md"} mb={"md"}
                        onPress={() => {
                            router.back();
                        }}
                        testID='exit-result'>
                        Exit
                    </FancyButton>

                </TScrollView>
            </TSafeArea >
        </>
    );
};

export function arraysEqual(arr1: any[], arr2: any[]): boolean {
    // First check if they are the same length
    if (arr1.length !== arr2.length) return false;

    // Then check each element in the array
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    // can use check mcq proposition correctness: check selectedIds

    // If all elements match, the arrays are equal
    return true;
}
export async function sendWith(
    previousAttempt: QuizzesAttempts.QuizAttempt | undefined,
    studentAnswers: QuizzesAttempts.Answer[],
    courseId: string,
    pathToAttempts: string,
    quizId: string | undefined
) {
    const numberOfAttempts = previousAttempt == undefined ? 1 : previousAttempt.attempts + 1;

    const res = await callFunction(QuizzesAttempts.Functions.createQuizAttempt, {
        quizAttempt: {
            attempts: numberOfAttempts,
            answers: studentAnswers
        },
        courseId: courseId,
        quizId: quizId,
        path: pathToAttempts
    });

    if (res.status === 1) {
        console.log(`OKAY, submitted quiz with id ${res.data.id}`);
    } else {
        console.log(`Error while submitting attempt`);
    }
}