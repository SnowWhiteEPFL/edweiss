import ReactComponent from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { CollectionOf } from '@/config/firebase';
import { useDoc } from '@/hooks/firebase/firestore';
import Quizzes from '@/model/quizzes';
import QuizzesAttempts from '@/model/quizzesAttempts';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';

import { ApplicationRoute } from '@/constants/Component';



const QuizzDisplay: ApplicationRoute = () => {

    const { id } = useLocalSearchParams();
    if (typeof id != 'string')
        return <Redirect href={'/'} />;

    const courseId = "placeholderCourseId";

    const quiz = useDoc(CollectionOf<Quizzes.Quiz>("courses/" + courseId + "/quizzes"), id);
    const [studentAnswers, setStudentAnswers] = useState<QuizzesAttempts.Answer[]>([]);

    useEffect(() => {
        if (quiz == undefined) {
            return;
        }
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


    if (quiz == undefined) {
        return <TActivityIndicator />;
    }
    const exercises = quiz?.data.exercises;

    const onUpdate = (newAnswer: QuizzesAttempts.Answer, id: number) => {
        const newStudentAnswers = [...studentAnswers];
        newStudentAnswers[id] = newAnswer;
        setStudentAnswers(newStudentAnswers);
    };

    return ( // for now, returns a scroll view instead of the "tiktok" format
        <TView>
            <FancyButton onPress={() => router.push("/quiz/quizzesList" as any)}>
                <TText>
                    Save and go back
                </TText>
            </FancyButton>
            <TScrollView>
                <For each={exercises}>
                    {
                        thisExercise => {
                            const thisIndex = exercises.indexOf(thisExercise);

                            if (thisExercise.type == "MCQ") {
                                return (<MCQDisplay exercise={thisExercise} onUpdate={onUpdate} exId={thisIndex} />);
                            }
                            else { // if type == "TF"
                                return (<TFDisplay exercise={thisExercise} onUpdate={onUpdate} exId={thisIndex} />);
                            };
                        }
                    }
                </For>
            </TScrollView>

        </TView >
    );
};

export default QuizzDisplay;

const MCQDisplay: ReactComponent<{ exercise: Quizzes.MCQ, onUpdate: (answer: QuizzesAttempts.Answer, id: number) => void, exId: number; }> = ({ exercise, onUpdate, exId }) => {
    // selectedIds represents the indices of the propositions that were selected by the student, in this exercise.
    const [selectedIds, setSelectedIds] = useState<QuizzesAttempts.MCQAnswersIndices>([]);


    const handleSelection = (propId: number) => {
        if (selectedIds.includes(propId)) {
            setSelectedIds(selectedIds.filter(currentId => currentId != propId)); // unselects proposition, removes id
        }
        else {
            setSelectedIds(selectedIds.concat([propId])); // adds id to list
        }
        onUpdate(selectedIds, exId); // updates answers at index exId

    };
    const handleColor = (propId: number) => {
        if (selectedIds.includes(propId)) {
            return "blue";
        }
        else {
            return "base";
        }
    };

    return (
        <TView mb={"xl"} backgroundColor='surface1' m={"md"}>

            <TView mb={"lg"} radius={999} p={"md"}>
                <TText>
                    {exercise.question}
                </TText>
            </TView>


            <For each={exercise.propositions}>
                {proposition =>
                    <TTouchableOpacity
                        onPress={() => handleSelection(exercise.propositions.indexOf(proposition))}
                        backgroundColor={handleColor(exercise.propositions.indexOf(proposition))}
                        mb={"md"} mr={"md"} ml={"md"}
                    >
                        <TText>
                            {proposition.description}
                        </TText>
                    </TTouchableOpacity>
                }
            </For>

        </TView>

    );
};

const TFDisplay: ReactComponent<{ exercise: Quizzes.TF, onUpdate: (answer: QuizzesAttempts.Answer, id: number) => void, exId: number; }> = ({ exercise, onUpdate, exId }) => {
    // selected represents the option (true or false) selected by the student, in this exercise.
    const [selected, setSelected] = useState<QuizzesAttempts.TFAnswer>(undefined);

    const handleSelection = (value: boolean) => {
        if (selected == undefined || selected != value) {
            setSelected(value);

        } else {
            setSelected(undefined); // de-select the option
        }
        onUpdate(selected, exId);

    };

    const handleColor = (value: boolean) => {
        if ((selected == undefined) || selected != value) {
            return "base";
        } else {
            return "blue";
        }
    };
    //test github

    return (
        <TView mb={"md"}>

            <TView mb={"lg"} radius={999} p={"md"} backgroundColor='surface0'>
                <TText>
                    {exercise.question}
                </TText>
            </TView>

            <TTouchableOpacity onPress={() => handleSelection(true)} radius={999} p={"md"} backgroundColor={handleColor(true)}>
                <TText>
                    True
                </TText>
            </TTouchableOpacity>

            <TTouchableOpacity onPress={() => handleSelection(false)} radius={999} p={"md"} backgroundColor={handleColor(false)}>
                <TText>
                    False
                </TText>
            </TTouchableOpacity>

        </TView>

    );
};