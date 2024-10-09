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
import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';

const QuizzDisplay: ReactComponent<{}> = (props) => {

    const [exerciseIndex, setExerciseIndex] = useState(0);

    const { id } = useLocalSearchParams();
    if (typeof id != 'string')
        return <Redirect href={'/'} />;

    const courseId = "placeholderCourseId";

    const quiz = useDoc(CollectionOf<Quizzes.Quiz>("courses/" + courseId + "/quizzes"), id);
    if (quiz == undefined) {
        return <TActivityIndicator />;
    }
    const exercises = quiz?.data.exercises;
    const quizLength = exercises.length;

    const handleNext = () => {
        if (exerciseIndex < quizLength - 1) {
            setExerciseIndex(exerciseIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (exerciseIndex > 0) {
            setExerciseIndex(exerciseIndex - 1);
        }
    };



    return (
        <TView>
            <FancyButton>
                Save answers and go back
            </FancyButton>
            <FancyButton onPress={handlePrevious}>
                Previous
            </FancyButton>
            <FancyButton onPress={handleNext}>
                Next
            </FancyButton>
            <ExerciseDisplay exercise={exercises[exerciseIndex]} />

        </TView >
    );
};

export default QuizzDisplay;

const ExerciseDisplay: ReactComponent<{ exercise: Quizzes.Exercise; }> = ({ exercise }) => {
    if (exercise.type == "MCQ") {
        const [selectedId, setSelectedId] = useState<number | undefined>(undefined);

        const handleSelection = (id: number) => {
            if (selectedId == undefined || selectedId != id) {
                setSelectedId(id);
            }
            else {
                setSelectedId(undefined); // unselect current selection
            }
        };
        const handleColor = (id: number) => {
            if (selectedId == undefined || selectedId != id) {
                return "base";
            }
            else {
                return "blue";
            }
        };

        return (
            <TScrollView>

                <TText mb={"xl"}>
                    {exercise.question}
                </TText>

                <For each={exercise.propositions}>
                    {proposition =>
                        <TTouchableOpacity
                            onPress={() => handleSelection(proposition.id)}
                            backgroundColor={handleColor(proposition.id)}
                            mb={"md"}
                        >
                            {proposition.description}
                        </TTouchableOpacity>
                    }
                </For>

            </TScrollView>

        );
    }
    else { // if type == "TF"
        const [selected, setSelected] = useState<boolean | undefined>(undefined);
        const handleSelectTrue = () => {
            if ((selected == undefined) || (selected == false)) {
                setSelected(true);
            }
            else {
                setSelected(undefined);
            }

        };
        const handleSelectFalse = () => {
            if ((selected == undefined) || (selected == true)) {
                setSelected(false);
            }
            else {
                setSelected(undefined);
            }
        };
        const handleTrueColor = () => {
            if ((selected == undefined) || (selected == false)) {
                return "base";
            }
            else {
                return "blue";
            }
        };
        const handleFalseColor = () => {
            if ((selected == undefined) || (selected == true)) {
                return "base";
            }
            else {
                return "blue";
            }
        };
        return (
            <TScrollView>

                <TText mb={'xl'}>
                    {exercise.question}
                </TText>

                <TTouchableOpacity onPress={handleSelectTrue} backgroundColor={handleTrueColor()}>
                    True
                </TTouchableOpacity>

                <TTouchableOpacity onPress={handleSelectFalse} backgroundColor={handleFalseColor()}>
                    False
                </TTouchableOpacity>



            </TScrollView>

        );
    }



};