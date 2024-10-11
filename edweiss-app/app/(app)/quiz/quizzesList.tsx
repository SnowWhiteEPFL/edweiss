import RouteHeader from '@/components/core/header/RouteHeader';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import For from '@/components/core/For';
import TText from '@/components/core/TText';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDoc, useDocs } from '@/hooks/firebase/firestore';
import Quizzes, { QuizzesAttempts } from '@/model/quizzes';
//import QuizzesAttempts from '@/model/quizzesAttempts';
import { router } from 'expo-router';

const QuizzesList: ApplicationRoute = () => {
    const courseId = "placeholderCourseId";
    const path = "courses/" + courseId + "/quizzes";
    const myQuizzes = useDocs(CollectionOf<Quizzes.Quiz>(path));
    const { uid } = useAuth();
    console.log(uid);
    return (
        <>
            <RouteHeader title='My quizzes' />

            <TScrollView>
                <For each={myQuizzes}>
                    {quiz => <QuizzOuterDisplay key={quiz.id} quiz={quiz.data} id={quiz.id} courseId={courseId} uid={uid}></QuizzOuterDisplay>}
                </For>
            </TScrollView >
            {/* <FancyButton mb={"md"}>
                Create new Quiz
            </FancyButton> */}
        </>
    );
};

export default QuizzesList;

const QuizzOuterDisplay: ReactComponent<{ quiz: Quizzes.Quiz, id: string, courseId: string, uid: string; }> = ({ quiz, id, courseId, uid }) => {
    const hasDeadline = quiz.deadline != undefined;
    const path = "courses/" + courseId + "/quizzes/" + id + "/attempts";
    const quizAttempt = useDoc(CollectionOf<QuizzesAttempts.QuizAttempt>(path), uid);

    return (
        <TTouchableOpacity onPress={() => router.push(`/quiz/${id}` as any)} backgroundColor='surface0' radius={'lg'} m={"sm"} p={"md"} px={"lg"}>

            <TText mb={"md"} size={"lg"}>
                {quiz.name}
            </TText>

            <TText color={hasDeadline ? "red" : "green"}>
                {hasDeadline ? "Until " + quiz.deadline + " to submit" : "No due date !"}
            </TText>
            <TText>
                Attempts: {quizAttempt?.data != undefined ? quizAttempt?.data.attempts : 0}
            </TText>
        </TTouchableOpacity>
    );
};

