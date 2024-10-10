import ReactComponent from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { CollectionOf } from '@/config/firebase';
import { useDoc } from '@/hooks/firebase/firestore';
import Quizzes from '@/model/quizzes';
import QuizzesAttempts from '@/model/quizzesAttempts';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { memo, useCallback, useEffect, useState } from 'react';

import TSafeArea from '@/components/core/containers/TSafeArea';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';

const QuizzDisplay: ApplicationRoute = () => {
    //console.log("ALl refresh");

    const { id } = useLocalSearchParams();
    if (typeof id != 'string')
        return <Redirect href={'/'} />;

    const courseId = "placeholderCourseId";

    const quiz = useDoc(CollectionOf<Quizzes.Quiz>("courses/" + courseId + "/quizzes"), id);
    const [studentAnswers, setStudentAnswers] = useState<QuizzesAttempts.Answer[]>([]);

    useEffect(() => {
        //console.log("I'm being used. kinky");

        if (quiz == undefined)
            return;

        const defaultAnswer = quiz.data.exercises.map(answ => {
            if (answ.type == "MCQ") {
                return [] as number[];
            }
            else {
                return undefined;
            }
        });
        setStudentAnswers(defaultAnswer);
    }, [quiz]);

    const onUpdate = useCallback((newAnswer: QuizzesAttempts.Answer, id: number) => {
        setStudentAnswers((oldStudentAnswers) => {
            const newStudentAnswers = [...oldStudentAnswers];
            newStudentAnswers[id] = newAnswer;
            return newStudentAnswers;
        });
    }, []);

    if (quiz == undefined) {
        return <TActivityIndicator />;
    }

    const exercises = quiz.data.exercises;

    return ( // for now, returns a scroll view instead of the "tiktok" format
        <>
            <RouteHeader disabled />
            <TSafeArea>
                <TScrollView>
                    <TText>
                        {JSON.stringify(studentAnswers)}
                    </TText>
                    <For each={exercises}>
                        {
                            (thisExercise, index) => {
                                if (thisExercise.type == "MCQ") {
                                    return (<MCQDisplay key={thisExercise.question} exercise={thisExercise} selectedIds={studentAnswers[index] as QuizzesAttempts.MCQAnswersIndices} onUpdate={onUpdate} exId={index} />);
                                }
                                else { // if type == "TF"
                                    return (<TFDisplay key={thisExercise.question} exercise={thisExercise} selected={studentAnswers[index] as QuizzesAttempts.TFAnswer} onUpdate={onUpdate} exId={index} />);
                                };
                            }
                        }
                    </For>

                    <FancyButton mt={"md"} mb={"md"} onPress={() => router.push("/quiz/quizzesList" as any)}>
                        Save and exit
                    </FancyButton>
                </TScrollView>
            </TSafeArea >
        </>
    );
};

export default QuizzDisplay;

const MCQDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: QuizzesAttempts.MCQAnswersIndices, onUpdate: (answer: QuizzesAttempts.Answer, id: number) => void, exId: number; }> = memo(({ exercise, selectedIds, onUpdate, exId }) => {
    const handleSelection = (propId: number) => {
        if (selectedIds.includes(propId)) {
            const newAnswer = selectedIds.filter(currentId => currentId != propId);
            onUpdate(newAnswer, exId);
            // unselects proposition, removes id
        }
        else if (exercise.numberOfAnswers > selectedIds.length) {
            const newAnswer = selectedIds.concat([propId]);
            onUpdate(newAnswer, exId); // adds id to list
        }
        // updates answers at index exId
    };
    const handleColor = (propId: number): Color => {
        if (selectedIds == undefined) {
            return "surface0";
        }
        if (selectedIds.includes(propId)) {
            return "blue";
        }
        else {
            return "surface0";
        }
    };

    const handleColorText = (propId: number): Color => {
        if (selectedIds == undefined) {
            return 'text';
        }
        if (selectedIds.includes(propId)) {
            return "base";
        }
        else {
            return 'text';
        }
    };

    return (
        <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"}>

            <TView mb={"lg"} radius={999} p={"md"}>
                <TText size={"lg"}>
                    {exercise.question}
                </TText>
            </TView>


            <For each={exercise.propositions}>
                {
                    (proposition, index) =>
                        <TTouchableOpacity
                            onPress={() => handleSelection(index)}
                            backgroundColor={handleColor(index)}
                            mb={"md"} mr={"md"} ml={"md"} p={"sm"} px={"md"}
                            radius={"xl"}
                        >
                            <TText color={handleColorText(index)}>
                                {proposition.description}
                            </TText>
                        </TTouchableOpacity>
                }
            </For>

        </TView>

    );
});

const TFDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: QuizzesAttempts.TFAnswer, onUpdate: (answer: QuizzesAttempts.Answer, id: number) => void, exId: number; }> = memo(({ exercise, selected, onUpdate, exId }) => {
    // selected represents the option (true or false) selected by the student, in this exercise.
    //console.log("TFDisplay refreshed");

    const handleSelection = (value: boolean) => {
        if (selected == undefined || selected != value) {
            onUpdate(value, exId);
        } else {
            onUpdate(undefined, exId); // de-select the option
        }
    };

    const handleColor = (value: boolean): Color => {
        if ((selected == undefined) || selected != value) {
            return "surface0";
        } else {
            return "blue";
        }
    };
    const handleColorText = (value: boolean): Color => {
        if ((selected == undefined) || selected != value) {
            return "text";
        } else {
            return "base";
        }
    };

    return (
        <TView mb={"xs"} bb={1} borderColor='surface0' m={"md"} radius={'lg'} p={"md"} pb={"xl"}>

            <TView mb={"lg"} radius={"xl"} p={"md"}>
                <TText size={"lg"}>
                    {exercise.question}
                </TText>
            </TView>

            <TView flexDirection='row' flexColumnGap={"xl"}>
                <TTouchableOpacity flex={1} onPress={() => handleSelection(true)} radius={"xl"} p={"md"} backgroundColor={handleColor(true)}>
                    <TText align='center' color={handleColorText(true)}>
                        True
                    </TText>
                </TTouchableOpacity>

                <TTouchableOpacity flex={1} onPress={() => handleSelection(false)} radius={"xl"} p={"md"} backgroundColor={handleColor(false)}>
                    <TText align='center' color={handleColorText(false)}>
                        False
                    </TText>
                </TTouchableOpacity>

            </TView>



        </TView>

    );
});