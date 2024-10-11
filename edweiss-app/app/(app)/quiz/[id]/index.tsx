import ReactComponent from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { callFunction, CollectionOf } from '@/config/firebase';
import { useDoc } from '@/hooks/firebase/firestore';
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

const QuizzDisplay: ApplicationRoute = () => {
    //console.log("ALl refresh");

    const { id } = useLocalSearchParams();
    if (typeof id != 'string')
        return <Redirect href={'/'} />;

    const courseId = "placeholderCourseId";

    const { uid } = useAuth();

    const quiz = useDoc(CollectionOf<Quizzes.Quiz>("courses/" + courseId + "/quizzes"), id);
    const previousAttempt = useDoc(CollectionOf<QuizzesAttempts.QuizAttempt>("courses/" + courseId + "/quizzes/" + id + "/attempts"), uid);
    const [studentAnswers, setStudentAnswers] = useState<QuizzesAttempts.Answer[]>([]);

    useEffect(() => {
        //console.log("I'm being used. kinky");

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
            quizId: quiz?.id
        });
        if (res.status == 1) {
            console.log(`OKAY, submitted quiz with id ${res.data.id}`);
        }
    }

    return ( // for now, returns a scroll view instead of the "tiktok" format
        <>
            <RouteHeader disabled />
            <TSafeArea>
                <TScrollView>
                    <TText>
                        {JSON.stringify(studentAnswers.map(a => a.value))}
                    </TText>
                    <For each={exercises}>
                        {
                            (thisExercise, index) => {
                                if (thisExercise.type == "MCQ" && studentAnswers[index] != undefined) {

                                    return (<MCQDisplay key={thisExercise.question} exercise={thisExercise} selectedIds={studentAnswers[index].value as number[]} onUpdate={onUpdate} exId={index} />);
                                }
                                else if (thisExercise.type == "TF" && studentAnswers[index] != undefined) { // if type == "TF"
                                    return (<TFDisplay key={thisExercise.question} exercise={thisExercise} selected={studentAnswers[index].value as boolean | undefined} onUpdate={onUpdate} exId={index} />);
                                } else {
                                    return (<ActivityIndicator />);
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
                        icon='save-sharp'>
                        Submit and exit
                    </FancyButton>
                </TScrollView>
            </TSafeArea >
        </>
    );
};

export default QuizzDisplay;

const MCQDisplay: ReactComponent<{ exercise: Quizzes.MCQ, selectedIds: number[], onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number; }> = memo(({ exercise, selectedIds, onUpdate, exId }) => {
    const handleSelection = (propId: number) => {
        requestAnimationFrame(() => {
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

        });

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

const TFDisplay: ReactComponent<{ exercise: Quizzes.TF, selected: boolean | undefined, onUpdate: (answer: number[] | boolean | undefined, id: number) => void, exId: number; }> = memo(({ exercise, selected, onUpdate, exId }) => {
    // selected represents the option (true or false) selected by the student, in this exercise.
    //console.log("TFDisplay refreshed");

    const handleSelection = (value: boolean) => {
        requestAnimationFrame(() => {
            if (selected == undefined || selected != value) {
                onUpdate(value, exId);
            } else {
                onUpdate(undefined, exId); // de-select the option
            }
        });

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
                <TTouchableOpacity flex={1} onPress={() => handleSelection(true)} radius={"xl"} p={"md"} backgroundColor={handleColor(true)} >
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