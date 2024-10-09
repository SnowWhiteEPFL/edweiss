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
    const path = "courses/exampleCourseId/quizzes";
    const myQuizzes = useDocs(CollectionOf<Quizzes.Quiz>(path));
    myQuizzes;
    return (
        <>
            <RouteHeader title='My quizzes' />

            <TScrollView>
                <For each={myQuizzes}>
                    {quiz => <QuizzOuterDisplay quiz={quiz.data} id={quiz.id}></QuizzOuterDisplay>}
                </For>
            </TScrollView>
            <FancyButton>
                Create new Quiz
            </FancyButton>
        </>
    );
};

export default QuizzesList;

const QuizzOuterDisplay: ReactComponent<{ quiz: Quizzes.Quiz, id: string; }> = (props) => {

    return (
        <TTouchableOpacity onPress={() => router.push(`/quiz/${props.id}` as any)}>
            <TText>
                {props.quiz.name}
            </TText>
            <TText>
                {props.quiz.deadline == undefined ? "No deadline" : "Until " + props.quiz.deadline + " to submit"}
            </TText>
            <TText>
                Attempts:
            </TText>
        </TTouchableOpacity>
    );
};

