/**
 * @file question.tsx
 * @description Main screen for displaying and managing the to do list in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import React from 'react';



// ------------------------------------------------------------
// -------------------  Main To do list Screen  ---------------
// ------------------------------------------------------------

const TodoListScreen: ApplicationRoute = () => {


    return (
        <>

            <RouteHeader title={t(`showtime:question_slide_title`)} />

            <TView
                justifyContent="center"
                alignItems="center"
                flex={1}>
                <TText>{t('showtime:empty_question')}</TText>
                <TText>{t('showtime:empty_question_funny_1')}</TText>
                <TText>{t('showtime:empty_question_funny_2')}</TText>
            </TView>


        </>
    );
};

export default TodoListScreen;

