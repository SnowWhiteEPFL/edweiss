/**
 * @file questionToDisplay.tsx
 * @description Main screen for handling the live student questions
 *              and broadcast it to showtime.
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
import { QuestionBroadcastModal } from '@/components/lectures/remotecontrol/modal';
import { CollectionOf, Document } from '@/config/firebase';
import t from '@/config/i18config';
import Colors from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useTheme from '@/hooks/theme/useTheme';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Vibration } from 'react-native';

// Types
type Lecture = LectureDisplay.Lecture;
type Question = LectureDisplay.Question;

// ------------------------------------------------------------
// --------------    Question To Slide Screen    --------------
// ------------------------------------------------------------

const QuestionToSlideScreen: ApplicationRoute = () => {
    // Argument Processing
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;



    // Modal References
    const modalRefQuestionBroadcast = useRef<BottomSheetModal>(null);

    //Hooks
    const [selQuestion, setSelQuestion] = useState("");
    const [selUsername, setSelUsername] = useState("Anonym");
    const [selLikes, setSelLikes] = useState(0);
    const [selID, setSelID] = useState("");
    const [broadcasted, setBroadcasted] = useState(""); // Store the currently broadcasted lecture 
    const theme = useTheme()
    const broadcastedColorBord = (theme === "light") ? 'rgba(4, 165, 229, 0.3)' : 'rgba(166, 227, 161, 0.6)';
    const broadcastedColorBack = (theme === "light") ? 'rgba(4, 165, 229, 0.08)' : 'rgba(166, 227, 161, 0.15)';
    const unbroadcastedColorBord = (theme === "light") ? Colors.light.surface2 : Colors.dark.surface2;
    const unbroadcastedColorBack = (theme === "light") ? Colors.light.crust : Colors.dark.crust;


    // Dynamic Document
    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const questionsDoc = useDynamicDocs(CollectionOf<Question>(`courses/${courseName}/lectures/${lectureId}/questions`));

    // Wait for lectureDoc to be available
    if (!lectureDoc) return <TActivityIndicator size={40} testID='quest-slide-activity-indicator' />;
    questionsDoc?.sort((a, b) => b.data.likes - a.data.likes) || []
    const questionDocPending = questionsDoc?.filter(question => !question.data.answered) || [];
    const currentLecture = lectureDoc.data;

    if (broadcasted === "" && currentLecture.event && currentLecture.event.type === "question") {
        setBroadcasted(currentLecture.event.id);
    }



    // Handle sigle question
    const QuestionDisplay: React.FC<{
        question: Document<Question>;
        index: number;
    }> = ({ question, index }) => {
        const { text, anonym, userID, likes, username } = question.data;
        const id = question.id;

        return (
            <TView key={index}
                style={{
                    backgroundColor: (broadcasted === id) ? broadcastedColorBack : unbroadcastedColorBack,
                    borderColor: (broadcasted === id) ? broadcastedColorBord : unbroadcastedColorBord
                }}
                b={'xl'}
                radius={'lg'}
                flex={1}
                flexDirection='column'
                ml='sm' mr='sm'
                mb='md'
            >
                <TTouchableOpacity onPress={() => { setSelID(id); setSelQuestion(text); setSelLikes(likes); setSelUsername(username); Vibration.vibrate(100); modalRefQuestionBroadcast.current?.present() }}>
                    <TView flexDirection='row' justifyContent='space-between' ml='md' mb='xs'>
                        {/* Person status */}
                        <TText size={'sm'} pl={2} pt={'sm'} color='text'>{anonym ? "Anonym" : username}</TText>

                        {/* Likes Status */}
                        <TView flexDirection='row' mt='sm' mr='sm'>
                            <TText>{likes}</TText>
                            <Icon size={'md'} name={likes === 0 ? 'heart-outline' : 'heart'} color='red' ml='xs' mt='xs'></Icon>
                        </TView>
                    </TView>

                    {/* Question Content */}
                    <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' justifyContent='space-between' alignItems='flex-start'>
                        <TText ml={10} color='overlay2'>{text}</TText>
                    </TView>
                </TTouchableOpacity>
            </TView >
        );
    }

    return (
        <>

            <RouteHeader title={t(`showtime:question_slide_title`)} />



            {questionDocPending && questionDocPending.length > 0 ? (
                <TScrollView>
                    <For each={questionDocPending}>
                        {(question, index) => <QuestionDisplay question={question} index={index} />}
                    </For>
                </TScrollView>
            ) : (
                <TView
                    justifyContent="center"
                    alignItems="center"
                    flex={1}>
                    <TText>{t('showtime:empty_question')}</TText>
                    <TText>{t('showtime:empty_question_funny_1')}</TText>
                    <TText>{t('showtime:empty_question_funny_2')}</TText>
                </TView>
            )}

            {/* Modal */}
            <QuestionBroadcastModal modalRef={modalRefQuestionBroadcast} id={selID} courseId={courseName} lectureId={lectureId} question={selQuestion} likes={selLikes} username={selUsername} broadcasted={broadcasted} setBroadcasted={setBroadcasted} onClose={() => modalRefQuestionBroadcast.current?.close()} />
        </>
    );
};

export default QuestionToSlideScreen;

