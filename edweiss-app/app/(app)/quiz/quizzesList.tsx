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


    //console.log(uid);
    return (
        <>
            <RouteHeader title='My quizzes' />

            <TScrollView>
                <For each={myQuizzes}>
                    {quiz => <QuizzOuterDisplay key={quiz.id} quiz={quiz.data} quizId={quiz.id} courseId={courseId} uid={uid} isResult={false}></QuizzOuterDisplay>}
                </For>
            </TScrollView >
            {/* <FancyButton mb={"md"}>
                Create new Quiz
            </FancyButton> */}
        </>
    );
};

export default QuizzesList;

export const QuizzOuterDisplay: ReactComponent<{ quiz: Quizzes.Quiz, quizId: string, courseId: string, uid: string, isResult: boolean; }> = ({ quiz, quizId, courseId, uid, isResult }) => {
    const hasDeadline = quiz.deadline != undefined;
    const path = "courses/" + courseId + "/quizzes/" + quizId + "/attempts";
    const quizAttempt = useDoc(CollectionOf<QuizzesAttempts.QuizAttempt>(path), uid);
    //const redirectPath = isResult ? 'results' : '/quiz/' + quizId;
    const navigate = () => {
        router.push({
            pathname: "/quiz/" + quizId as any,
            params: {
                quizId: quizId,
                path: "courses/" + courseId + "/quizzes"
            }
        });
    };


    return (
        <TTouchableOpacity onPress={() => navigate()} backgroundColor='surface0' radius={'lg'} m={"sm"} p={"md"} px={"lg"}>

            <TText mb={"md"} size={"lg"}>
                {isResult ? "Results of " + quiz.name : quiz.name}
            </TText>

            {/* <TText color={hasDeadline ? "red" : "green"}>
                {hasDeadline ? "Until " + quiz.deadline + " to submit" : "No due date !"}
            </TText>
            <TText>
                Attempts: {quizAttempt?.data != undefined ? quizAttempt?.data.attempts : 0}
            </TText> */}
            <AdditionalInfo isResult={false} hasDeadline={hasDeadline} quizAttempt={quizAttempt?.data}></AdditionalInfo>
        </TTouchableOpacity>
    );
};

const AdditionalInfo: ReactComponent<{ isResult: boolean, hasDeadline?: boolean, deadline?: string, quizAttempt?: QuizzesAttempts.QuizAttempt; }> = ({ isResult, hasDeadline, deadline, quizAttempt }) => {
    if (isResult) {
        return (
            <></>
        );
    };
    return (
        <>
            <TText color={hasDeadline ? "red" : "green"}>
                {hasDeadline ? "Until " + deadline + " to submit" : "No due date !"}
            </TText>
            <TText>
                Attempts: {quizAttempt != undefined ? quizAttempt?.attempts : 0}
            </TText>
        </>

    );
};
