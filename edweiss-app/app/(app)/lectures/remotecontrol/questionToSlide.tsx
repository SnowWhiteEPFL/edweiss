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
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { CollectionOf, Document } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

// Types
type Lecture = LectureDisplay.Lecture;
type Question = LectureDisplay.Question;

// ------------------------------------------------------------
// --------------    Question To Slide Screen    --------------
// ------------------------------------------------------------

const TodoListScreen: ApplicationRoute = () => {

    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;

    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);
    const questionsDoc = useDynamicDocs(CollectionOf<Question>(`courses/${courseName}/lectures/${lectureId}/questions`));

    // Wait for lectureDoc to be available
    if (!lectureDoc) return <TActivityIndicator size={40} testID='quest-slide-activity-indicator' />;
    const currentLecture = lectureDoc.data;
    questionsDoc?.sort((a, b) => b.data.likes - a.data.likes) || []


    const QuestionDisplay: React.FC<{
        question: Document<Question>;
        index: number;
    }> = ({ question, index }) => {
        const { text, anonym, userID, likes, username } = question.data;
        const id = question.id;

        return (
            <TView key={index}
                backgroundColor='crust'
                borderColor='surface2'
                b={'xl'}
                radius={'lg'}
                flex={1}
                flexDirection='column'
                ml='sm' mr='sm'
                mb='md'
            >
                <TView flexDirection='row' justifyContent='space-between' ml='md' mb='xs'>
                    {/* Person status */}
                    <TText size={'sm'} pl={2} pt={'sm'} color='text'>{anonym ? "Anonym" : username}</TText>

                    {/* Likes Status */}
                    <TView flexDirection='row' mt='sm' mr='sm'>
                        <TText>{likes}</TText>
                        <Icon size={'md'} name={likes === 0 ? 'heart-outline' : 'heart'} color='red' ml='xs' mt='xs'></Icon>
                    </TView>
                </TView>

                <TView pr={'sm'} pl={'md'} pb={'sm'} flexDirection='row' justifyContent='space-between' alignItems='flex-start'>

                    {/* Question Content */}
                    <TText ml={10} color='overlay2'>{text}</TText>

                    {/* Squash tle likes at the right most position */}
                    <TView flex={1}></TView>


                </TView>
            </TView >
        );
    }

    return (
        <>

            <RouteHeader title={t(`showtime:question_slide_title`)} />



            {questionsDoc ? (
                <TScrollView>
                    <For each={questionsDoc}>
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


        </>
    );
};

export default TodoListScreen;

