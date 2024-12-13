/**
 * @file questionToDisplay.tsx
 * @description Main screen for handling the live quiz 
 *              broadcasting to the lecture slide 
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { QuizBroadcastModal } from '@/components/lectures/remotecontrol/modal';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import Colors from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useTheme from '@/hooks/theme/useTheme';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { LectureQuizzes } from '@/model/quizzes';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Vibration } from 'react-native';

// Types
type Lecture = LectureDisplay.Lecture;
type Quiz = LectureDisplay.QuizLectureEvent;

// ------------------------------------------------------------
// ----------------    Quiz To Slide Screen     ---------------
// ------------------------------------------------------------

const QuizToSlideScreen: ApplicationRoute = () => {
    // Argument Processing
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;



    // Modal References
    const modalRefQuizBroadcast = useRef<BottomSheetModal>(null);

    //Hooks
    const [selID, setSelID] = useState("");
    const [selQuiz, setSelQuiz] = useState<LectureQuizzes.LectureQuiz>();
    const [broadcasted, setBroadcasted] = useState(""); // Store the currently broadcasted quiz 



    // Dynamic Document
    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const quizDoc = useDynamicDocs(CollectionOf<Quiz>(`courses/${courseName}/lectures/${lectureId}/lectureEvents`));

    // Wait for lectureDoc to be available
    if (!lectureDoc) return <TActivityIndicator size={40} testID='quiz-slide-activity-indicator' />;
    quizDoc?.sort((a, b) => a.data.pageNumber - b.data.pageNumber);
    const quizDocPending = quizDoc?.filter(quiz => !quiz.data.done) || [];
    const currentLecture = lectureDoc.data;

    console.log("quizDoc: ", quizDocPending);

    // Set the current broadcasted if the user just 
    // comes back from another screen
    if (broadcasted === "" && currentLecture.event && currentLecture.event.type === "quiz") {
        setBroadcasted(currentLecture.event.id);
    }






    return (
        <>

            <RouteHeader title={t(`showtime:quiz_slide_title`)} />



            {quizDocPending && quizDocPending.length > 0 ? (
                <TScrollView>
                    <For each={quizDocPending}>
                        {(quiz, index) => <QuizDisplay index={index} pageNumber={quiz.data.pageNumber} quizID={quiz.id} quizModel={quiz.data.quizModel} broadcasted={broadcasted} setSelID={setSelID} setSelQuiz={setSelQuiz} modalRefQuizBroadcast={modalRefQuizBroadcast} />}
                    </For>
                </TScrollView>
            ) : (
                <TView
                    justifyContent="center"
                    alignItems="center"
                    flex={1}>
                    <TText>{t('showtime:empty_quiz')}</TText>
                    <TText>{t('showtime:empty_quiz_funny_1')}</TText>
                    <TText>{t('showtime:empty_quiz_funny_2')}</TText>
                </TView>

            )}

            {/* Modal */}
            <QuizBroadcastModal modalRef={modalRefQuizBroadcast} id={selID} quizModel={selQuiz} courseId={courseName} lectureId={lectureId} broadcasted={broadcasted} setBroadcasted={setBroadcasted} onClose={() => modalRefQuizBroadcast.current?.close()} />
        </>
    );
};

export default QuizToSlideScreen;



// ---------------------------------------------
// ----   Utils Question Display Component  ----
// ---------------------------------------------

const QuizDisplay: React.FC<{
    index: number;
    quizModel: LectureQuizzes.LectureQuiz;
    pageNumber: number;
    quizID: string,
    broadcasted: string;
    setSelID: (id: string) => void;
    setSelQuiz: (quiz: LectureQuizzes.LectureQuiz) => void;
    modalRefQuizBroadcast: React.RefObject<BottomSheetModal>;
}> = ({ index, quizModel, pageNumber, quizID, broadcasted, setSelID, setSelQuiz, modalRefQuizBroadcast }) => {
    const { exercise, ended, answer, showResultToStudents } = quizModel;

    const theme = useTheme()
    const broadcastedColorBord = (theme === "light") ? 'rgba(4, 165, 229, 0.3)' : 'rgba(166, 227, 161, 0.6)';
    const broadcastedColorBack = (theme === "light") ? 'rgba(4, 165, 229, 0.08)' : 'rgba(166, 227, 161, 0.15)';
    const unbroadcastedColorBord = (theme === "light") ? Colors.light.surface2 : Colors.dark.surface2;
    const unbroadcastedColorBack = (theme === "light") ? Colors.light.crust : Colors.dark.crust;

    return (
        <TView key={index}
            style={{
                backgroundColor: (broadcasted === quizID) ? broadcastedColorBack : unbroadcastedColorBack,
                borderColor: (broadcasted === quizID) ? broadcastedColorBord : unbroadcastedColorBord
            }}
            b={'xl'}
            radius={'lg'}
            flex={1}
            flexDirection='column'
            ml='sm' mr='sm'
            mb='md'
        >
            <TTouchableOpacity onPress={() => { setSelID(quizID); setSelQuiz(quizModel); Vibration.vibrate(100); modalRefQuizBroadcast.current?.present() }}>
                <TView flexDirection='row' justifyContent='space-between' ml='md' mb='xs'>
                    {/* Person status */}
                    <TText size={'sm'} pl={2} pt={'sm'} color='text'>{exercise.type === "MCQ" ? "Multiple Question" : "True False"}</TText>



                    {/* Likes Status */}
                    <TView flexDirection='row' mt='sm' mr='sm'>
                        <TText>{pageNumber}</TText>
                        <Icon size={'md'} name='newspaper-outline' color='blue' ml='xs' mt='xs'></Icon>
                    </TView>
                </TView>

                {/* Question Content */}
                <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
                    <TText ml='md' color='overlay2'>{exercise.question}</TText>
                </TView>
            </TTouchableOpacity>
        </TView >
    );
}