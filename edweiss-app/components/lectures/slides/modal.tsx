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
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import Icon from '@/components/core/Icon';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import ReactComponent from '@/constants/Component';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { transModeIconMap, transModeNameMap } from '@/utils/lectures/slides/utilsFunctions';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { t } from 'i18next';
import React from 'react';

// type
type TranscriptLangMode = LectureDisplay.TranscriptLangMode;


// ------------------------------------------------------------
// -------      Transcription Mode Selection Modal      -------
// ------------------------------------------------------------

export const TranscriptModeModal: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    transMode: TranscriptLangMode;
    setTransMode: (mode: TranscriptLangMode) => void;
    onClose: () => void;
}> = ({ modalRef, transMode, setTransMode, onClose }) => {

    return (
        <ModalContainer modalRef={modalRef}>
            <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{t('showtime:rmt_cntl_lang_section')}</TText>
                </TView>

                <TScrollView>

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
                            'hindi'] as TranscriptLangMode[]).map((mode, index) => {
                                return (

                                    <TTouchableOpacity onPress={() => setTransMode(mode)} ml='lg' mr='md' testID={`trans-sel-but-${index}`} key={index}>
                                        <TView flexDirection='row' alignItems='center' pb={'sm'}>
                                            <Icon
                                                name={transMode === mode ? 'checkbox-outline' : 'square-outline'}
                                                color={transMode === mode ? 'green' : 'text'}
                                                size={25}
                                            />

                                            <TText ml='md' color={transMode === mode ? 'text' : 'surface0'}>
                                                {transModeIconMap[mode]} {transModeNameMap[mode]}
                                            </TText>

                                        </TView >

                                    </TTouchableOpacity>

                                );
                            })}
                    </TView>

                    <FancyButton backgroundColor='subtext0' m='md' mb='lg' onPress={onClose} outlined testID='trans-mode-sel-close-button'>
                        {t('showtime:close_btn')}
                    </FancyButton>
                </TScrollView>

            </>
        </ModalContainer >
    );
};
