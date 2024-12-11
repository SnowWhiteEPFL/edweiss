/**
 * @file modal.tsx
 * @description The modal embedded in the lecture/slides/index.tsx 
 *              to display the the transcript selection mode
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import ReactComponent from '@/constants/Component';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { t } from 'i18next';
import React, { useState } from 'react';

// type
type TranscriptLangMode = LectureDisplay.TranscriptLangMode;


// ------------------------------------------------------------
// -------      Transcription Mode Selection Modal      -------
// ------------------------------------------------------------

export const TranscriptModeModal: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    mode: TranscriptLangMode;
    setTransMode: (mode: TranscriptLangMode) => void;
    onClose: () => void;
}> = ({ modalRef, mode, setTransMode, onClose }) => {

    const [tmpSelectedMode, setTmpSelectedMode] = useState(mode); // Selected Mode Hook

    return (
        <ModalContainer modalRef={modalRef}>
            <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{t('showtime:rmt_cntl_lang_section')}</TText>
                </TView>

                <TScrollView>
                    <TView justifyContent='center' alignItems='center'>
                        <TView>
                            {(['original',
                                'english',
                                'french',
                                'german',
                                'spanish',
                                'italian',
                                'brazilian',
                                'arabic',
                                'chinese',
                                'vietanames',
                                'hindi'] as TranscriptLangMode[]).map((language, index, array) => {
                                    return <TText p='sm'>{language}</TText>;
                                })}
                        </TView>
                    </TView>

                </TScrollView>

                <FancyButton backgroundColor='subtext0' m='md' onPress={onClose} outlined testID='trad-mode-sel-close-button'>
                    {t('todo:close_btn')}
                </FancyButton>
            </>
        </ModalContainer>
    );
};


// Put the selection module in here