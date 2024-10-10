import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import For from '@/components/core/For';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { CollectionOf } from '@/config/firebase';
import { useDocs } from '@/hooks/firebase/firestore';
import Quizzes from '@/model/quizzes';
import { router } from 'expo-router';

const QuizzesList: ApplicationRoute = () => {
    const path = "courses/placeholderCourseId/quizzes";
    const myQuizzes = useDocs(CollectionOf<Quizzes.Quiz>(path));
    return (
        <>
            <RouteHeader title='My quizzes' />

            <TScrollView>
                <For each={myQuizzes}>
                    {quiz => <QuizzOuterDisplay quiz={quiz.data} id={quiz.id}></QuizzOuterDisplay>}
                </For>
            </TScrollView>
            <FancyButton mb={"md"}>
                Create new Quiz
            </FancyButton>
        </>
    );
};

export default QuizzesList;

const QuizzOuterDisplay: ReactComponent<{ quiz: Quizzes.Quiz, id: string; }> = ({ quiz, id }) => {

    return (
        <TTouchableOpacity onPress={() => router.push(`/quiz/${id}` as any)} backgroundColor='surface0' radius={'lg'} m={"sm"} p={"md"}>
            <TText mb={"sm"}>
                {quiz.name}
            </TText>
            <TText>
                {quiz.deadline == undefined ? "No deadline" : "Until " + quiz.deadline + " to submit"}
            </TText>
            <TText>
                Attempts:
            </TText>
        </TTouchableOpacity>
    );
};

