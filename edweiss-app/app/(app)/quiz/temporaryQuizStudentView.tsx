import ReactComponent from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { callFunction, CollectionOf } from '@/config/firebase';
import { useDoc, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';

import TSafeArea from '@/components/core/containers/TSafeArea';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { ActivityIndicator } from 'react-native';

const TempQuizStudentViewPage: ApplicationRoute = () => {

    const { quizId, path, courseId } = useLocalSearchParams();
    if (typeof quizId != 'string')
        return <Redirect href={'/'} />;

    //const courseId = "placeholderCourseId";
    const pathToAttempts = path + "/" + quizId + "/attempts";

    const { uid } = useAuth();

    const [quiz, loading] = usePrefetchedDynamicDoc(CollectionOf<Quizzes.Quiz>(path as string), quizId, undefined);
    const previousAttempt = useDoc(CollectionOf<QuizzesAttempts.QuizAttempt>(pathToAttempts), uid);
    const [studentAnswers, setStudentAnswers] = useState<QuizzesAttempts.Answer[]>([]);

    useEffect(() => {

        if (quiz == undefined || quiz.data == undefined || quiz.data.exercises == undefined)
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

    const onUpdate = useCallback((newAnswer: number[] | boolean | undefined, id: number) => {
        setStudentAnswers((oldStudentAnswers) => {
            const newStudentAnswers = [...oldStudentAnswers];
            newStudentAnswers[id].value = newAnswer;
            return newStudentAnswers;
        });
    }, []);

    if (quiz == undefined) {
        return <TActivityIndicator />;
    }

    const exercises = quiz.data.exercises;

    async function send() {
        const attempts = previousAttempt?.data == undefined ? 1 : previousAttempt.data?.attempts + 1;

        const res = await callFunction(QuizzesAttempts.Functions.createQuizAttempt, {
            quizAttempt: {
                attempts: attempts,
                answers: studentAnswers
            },
            courseId: courseId,
            quizId: quiz?.id,
            path: pathToAttempts as string
        });
        if (res.status == 1) {
            console.log(`OKAY, submitted quiz with id ${res.data.id}`);
        }
    }

    if (quiz.data.showResultToStudents && previousAttempt != undefined) {
        return <QuizResultDisplay key={quiz.id + "result"} studentAnswers={previousAttempt.data.answers} exercises={exercises} results={quiz.data.answers}></QuizResultDisplay>;
    }
    else if (!quiz.data.showResultToStudents) {
        return <QuizDisplay key={quiz.id + "live"} studentAnswers={studentAnswers} exercises={exercises} onUpdate={onUpdate} send={send}></QuizDisplay>;
    }
    else {
        return (<TActivityIndicator />);
    }

};

export default TempQuizStudentViewPage;

// async function toggleResult(quiz: Quizzes.Quiz, thisCourseId: string) {
//     console.log("inside toggle");
//     const res = await callFunction(Quizzes.Functions.updateQuiz, {
//         quiz: {
//             ...quiz,
//             showResultToStudents: !quiz.showResultToStudents
//         },
//         courseId: thisCourseId,
//     });
//     console.log("pushed change to db");
//     if (res.status == 1) {
//         console.log(`OKAY, updated quiz with id ${res.data.id}`);
//     }

// }

export const QuizDisplay: ReactComponent<{ studentAnswers: QuizzesAttempts.Answer[], exercises: Quizzes.Exercise[], onUpdate: (answer: number[] | boolean | undefined, id: number) => void, send: () => void; }> = ({ studentAnswers, exercises, onUpdate, send, }) => {
    return ( // for now, returns a scroll view instead of the "tiktok" format
        <>
            <RouteHeader disabled />
            <TSafeArea>
                <TScrollView>
                    <TText>
                        {/*JSON.stringify(studentAnswers.map(a => a.value))*/}
                    </TText>
                    <For each={exercises}>
                        {
                            (thisExercise, index) => {
                                if (thisExercise.type == "MCQ" && studentAnswers[index] != undefined) {

                                    return (<MCQDisplay key={index} exercise={thisExercise} selectedIds={studentAnswers[index].value as number[]} onUpdate={onUpdate} exId={index} />);
                                }
                                else if (thisExercise.type == "TF" && studentAnswers[index] != undefined) { // if type == "TF"
                                    return (<TFDisplay key={index} exercise={thisExercise} selected={studentAnswers[index].value as boolean | undefined} onUpdate={onUpdate} exId={index} />);
                                } else {
                                    return (<ActivityIndicator />);
                                }
                            }
                        }
                    </For>

                    <FancyButton
                        mt={"md"} mb={"md"}
                        onPress={() => {
                            if (send != undefined) {
                                send();
                            }
                            router.back();
                        }}
                        icon='save-sharp'>
                        Submit and exit
                    </FancyButton>
                    {/* <FancyButton onPress={() => toggleResult(quiz, "placeholderCourseId")}>
                        Toggle result boolean
                    </FancyButton> */}
                </TScrollView>
            </TSafeArea >
        </>
    );
};

export const QuizResultDisplay: ReactComponent<{ studentAnswers: QuizzesAttempts.Answer[], results: QuizzesAttempts.Answer[], exercises: Quizzes.Exercise[]; }> = ({ studentAnswers, results, exercises }) => {

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
                <TScrollView>
                    {/* <TText>
                        JSON.stringify(studentAnswers.map(a => a.value))
                    </TText> */}
                    <TView p={'xl'}>
                        <TText size={'xl'}>
                            Your score : {score}/{exercises.length}
                        </TText>
                    </TView>

                    <For each={exercises}>
                        {
                            (thisExercise, index) => {
                                if (thisExercise.type == "MCQ" && studentAnswers[index] != undefined) {

                                    return (<MCQResultDisplay key={index} exercise={thisExercise} selectedIds={studentAnswers[index].value as number[]} results={results[index].value as number[]} />);
                                }
                                else if (thisExercise.type == "TF" && studentAnswers[index] != undefined) { // if type == "TF"
                                    return (<TFResultDisplay key={index} exercise={thisExercise} selected={studentAnswers[index].value as boolean | undefined} result={results[index].value as boolean} />);
                                } else {
                                    return (<ActivityIndicator />);
                                }
                            }
                        }
                    </For>

                    <FancyButton
                        mt={"md"} mb={"md"}
                        onPress={() => {
                            router.back();
                        }}>
                        Exit
                    </FancyButton>
                    {/* <FancyButton onPress={() => toggleResult(quiz, "placeholderCourseId")}>
                        Toggle result boolean
                    </FancyButton> */}
                </TScrollView>
            </TSafeArea >
        </>
    );
};

// export const QuizExerciseOverhead: ReactComponent<{ question: string, }> = ({ question, }) => {
//     return (
//         <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"}>

//             <TView mb={"lg"} radius={999} p={"md"}>
//                 <TText size={"lg"}>
//                     {question}
//                 </TText>
//             </TView>

//         </TView>
//     );
// };


export const MCQDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number, }> = memo(({ exercise, selectedIds, onUpdate, exId }) => {
    const handleSelection = (propId: number) => {
        requestAnimationFrame(() => {
            let newAnswer;
            if (selectedIds.includes(propId)) {
                newAnswer = selectedIds.filter(currentId => currentId != propId); // unselects proposition, removes id
            }
            else if (exercise.numberOfAnswers > selectedIds.length) {
                newAnswer = selectedIds.concat([propId]);// adds id to list
            }
            else if (exercise.numberOfAnswers == 1 && selectedIds.length == 1) {
                newAnswer = selectedIds.map(e => propId);
            }
            else {
                newAnswer = selectedIds;
            }
            onUpdate(newAnswer, exId);  // updates answers at index exId
        });
    };

    return (
        <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"}>

            <TView mb={"lg"} radius={999} p={"md"}>
                <TText size={"lg"}>
                    {exercise.question} - {exercise.numberOfAnswers} answer(s)
                </TText>
            </TView>

            <For each={exercise.propositions}>
                {(proposition, index) =>
                    <TTouchableOpacity key={exercise.question + index}
                        onPress={() => handleSelection(index)}
                        backgroundColor={handleMCQColor(selectedIds, index)}
                        mb={"md"} mr={"md"} ml={"md"} p={"sm"} px={"md"}
                        radius={"xl"}>
                        <TText color={textColor(handleMCQColor(selectedIds, index))}>
                            {proposition.description}
                        </TText>
                    </TTouchableOpacity>}
            </For>
        </TView>
    );
});

export const MCQResultDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], results: number[]; }> = ({ exercise, selectedIds, results }) => {
    return (
        <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"}>

            <TView mb={"lg"} radius={999} p={"md"}>
                <TText size={"lg"}>
                    {exercise.question}
                </TText>
            </TView>

            <For each={exercise.propositions}>
                {(proposition, index) =>
                    <TTouchableOpacity key={exercise.question + index}
                        backgroundColor={checkResultColor(checkMCQPropositionCorrect(selectedIds, results, index))}
                        mb={"md"} mr={"md"} ml={"md"} p={"sm"} px={"md"}
                        radius={"xl"}>
                        <TText color={textColor(checkResultColor(checkMCQPropositionCorrect(selectedIds, results, index)))}>
                            {proposition.description}
                        </TText>
                    </TTouchableOpacity>}
            </For>
        </TView>
    );
};


export const TFDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number; }> = memo(({ exercise, selected, onUpdate, exId }) => {
    // selected represents the option (true or false) selected by the student, in this exercise.

    const handleSelection = (value: boolean) => {
        requestAnimationFrame(() => {
            if (selected == undefined || selected != value) {
                onUpdate(value, exId);
            } else {
                onUpdate(undefined, exId);// de-select the option
            }
        });
    };

    return (
        <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"} pb={"xl"}>

            <TView mb={"lg"} radius={"xl"} p={"md"}>
                <TText size={"lg"}>
                    {exercise.question}
                </TText>
            </TView>

            <TView flexDirection='row' flexColumnGap={"xl"}>
                <TTouchableOpacity flex={1} onPress={() => { handleSelection(true); }} radius={"xl"} p={"md"} backgroundColor={handleTFColor(selected, true)} >
                    <TText align='center' color={textColor(handleTFColor(selected, true))}>
                        True
                    </TText>
                </TTouchableOpacity>

                <TTouchableOpacity flex={1} onPress={() => handleSelection(false)} radius={"xl"} p={"md"} backgroundColor={handleTFColor(selected, false)}>
                    <TText align='center' color={textColor(handleTFColor(selected, false))}>
                        False
                    </TText>
                </TTouchableOpacity>

            </TView>
        </TView>

    );
});

const TFResultDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, result: boolean; }> = ({ exercise, selected, result }) => {
    return (
        <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"} pb={"xl"}>

            <TView mb={"lg"} radius={"xl"} p={"md"}>
                <TText size={"lg"}>
                    {exercise.question}
                </TText>
            </TView>

            <TView flexDirection='row' flexColumnGap={"xl"}>
                <TTouchableOpacity flex={1} radius={"xl"} p={"md"} backgroundColor={checkResultColor(checkTFCorrect(selected, true, result))} >
                    <TText align='center' color={textColor(checkResultColor(checkTFCorrect(selected, true, result)))}>
                        True
                    </TText>
                </TTouchableOpacity>

                <TTouchableOpacity flex={1} radius={"xl"} p={"md"} backgroundColor={checkResultColor(checkTFCorrect(selected, false, result))}>
                    <TText align='center' color={textColor(checkResultColor(checkTFCorrect(selected, false, result)))}>
                        False
                    </TText>
                </TTouchableOpacity>

            </TView>
        </TView>

    );
};

export function checkResultColor(correctness: Quizzes.Results): Color {
    switch (correctness) {
        case 'unselected': return 'surface0';
        case 'wrong': return 'red';
        case 'missing': return 'yellow';
        case 'correct': return 'green';
    }
}

export function handleTFColor(selected: boolean | undefined, propValue: boolean): Color {
    if (selected == undefined) {
        return "surface0";
    }
    if (selected != propValue) {
        return "surface0";
    }
    else {
        return "blue";
    }
}
export function handleMCQColor(selectedIds: number[], propositionIndex: number): Color {

    if (selectedIds == undefined) {
        return "surface0";
    }
    if (selectedIds.includes(propositionIndex)) {
        return "blue";
    }
    else {
        return "surface0";
    }

}

export function checkMCQPropositionCorrect(selectedIds: number[], result: number[], propId: number): Quizzes.Results {
    if (!selectedIds.includes(propId) && !result.includes(propId)) {
        return 'unselected';
    }
    if (selectedIds.includes(propId) && !result.includes(propId)) {
        return 'wrong';
    }
    if (!selectedIds.includes(propId) && result.includes(propId)) {
        return 'missing';
    }
    else {
        return 'correct';
    }
}

export function checkTFCorrect(selected: boolean | undefined, propositionValue: boolean, result: boolean): Quizzes.Results {
    if (selected == undefined) {
        if (propositionValue == result) {
            return 'missing';
        }
        else {
            return 'unselected';
        }
    }
    else if (propositionValue == selected && propositionValue == result) {
        return 'correct';
    }
    else if (propositionValue != selected && propositionValue == result) {
        return 'missing';
    } else if (propositionValue == selected && propositionValue != result) {
        return 'wrong';
    }
    else {
        return 'unselected';
    }
}
export function textColor(backgroundColor: Color) {
    return backgroundColor == 'surface0' ? 'text' : 'base';
}


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