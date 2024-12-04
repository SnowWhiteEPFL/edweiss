/**
 * @file modal.tsx
 * @description The modal embedded in the AbstractRmtCtl component 
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { LightDarkProps } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import useTheme from '@/hooks/theme/useTheme';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { t } from 'i18next';
import React from 'react';
import { langIconMap, langNameMap } from '../../../utils/lectures/remotecontrol/utilsFunctions';

// type
type AvailableLangs = LectureDisplay.AvailableLangs;


// ------------------------------------------------------------
// -------------      Language Selection Modal    -------------
// ------------------------------------------------------------

export const LangSelectModal: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    lang: AvailableLangs;
    setLang: (lang: AvailableLangs) => void;
    onClose: () => void;
}> = ({ modalRef, lang, setLang, onClose }) => {

    return (
        <ModalContainer modalRef={modalRef}>
            <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{t('showtime:rmt_cntl_lang_section')}</TText>
                </TView>

                <TScrollView>
                    <TView justifyContent='center' alignItems='center'>
                        <TView>
                            {(['english', 'french', 'german', 'spanish', 'italian', 'brazilian', 'arabic', 'chinese', 'vietanames', 'hindi'] as AvailableLangs[]).map((language, index, array) => {
                                if (index % 2 === 0 && index + 1 < array.length) {
                                    return (
                                        <TwoLangsSelection
                                            key={language}
                                            lang={lang}
                                            setLang={setLang}
                                            lang1={language}
                                            lang2={array[index + 1]}
                                        />
                                    );
                                }
                                return null;
                            })}
                        </TView>
                    </TView>

                </TScrollView>

                <FancyButton backgroundColor='subtext0' m='md' onPress={onClose} outlined testID='lang-sel-close-button'>
                    {t('todo:close_btn')}
                </FancyButton>
            </>
        </ModalContainer>
    );
};


// ------------------------------------------------------------
// ---------    Utils Sub Component For Lang Display    -------
// ------------------------------------------------------------

interface TwoLangsSelectionProps {
    lang: AvailableLangs;
    setLang: (lang: AvailableLangs) => void;
    lang1: AvailableLangs;
    lang2?: AvailableLangs;
}
/**
 * Note: this component can handle an odd number of langs passed as input.
 * You just would have to let lang2 tobe undefined
 */
const TwoLangsSelection: React.FC<TwoLangsSelectionProps & LightDarkProps> = ({ lang, setLang, lang1, lang2 }) => {
    const theme = useTheme()


    /* Color pallette for selected/unselected languages
     * Note: this are `sky` and `green` in which there alpha has been modified
     */
    const unselectedColorBord = (theme === "light") ? 'rgba(4, 165, 229, 0.15)' : 'rgba(166, 227, 161, 0.6)';
    const unselectedColorBack = (theme === "light") ? 'rgba(4, 165, 229, 0.01)' : 'rgba(166, 227, 161, 0.15)';
    const selectedColorBord = (theme === "light") ? 'rgba(64, 160, 43, 0.6)' : 'rgba(137, 220, 235, 0.7)';
    const selectedColorBack = (theme === "light") ? 'rgba(64, 160, 43, 0.1)' : 'rgba(137, 220, 235, 0.3)';

    return (

        <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
            <TTouchableOpacity
                ml={'sm'} radius={'lg'} b={2}
                style={{
                    borderColor: (lang === lang1) ? selectedColorBord : unselectedColorBord,
                    backgroundColor: (lang === lang1) ? selectedColorBack : unselectedColorBack,
                    width: 160, height: 65
                }}
                onPress={() => setLang(lang1)}
                testID={`lang-but-${lang1}`}
            >
                <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                    <TText size={'lg'} >{langIconMap[lang1]}</TText>
                    <TView flex={1} alignItems='center'>
                        <TText size={'lg'} align='center'>{langNameMap[lang1]}</TText>
                    </TView>
                </TView>
            </TTouchableOpacity>

            {lang2 && (
                <>
                    <TView flex={1} ml={'sm'} mr={'sm'}></TView>
                    <TTouchableOpacity
                        mr={'sm'} radius={'lg'} b={2}
                        style={{
                            borderColor: (lang === lang2) ? selectedColorBord : unselectedColorBord,
                            backgroundColor: (lang === lang2) ? selectedColorBack : unselectedColorBack,
                            width: 160, height: 65
                        }}
                        onPress={() => setLang(lang2)}
                        testID={`lang-but-${lang2}`}
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap[lang2]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap[lang2]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>
                </>
            )}
        </TView>
    );
};


// ------------------------------------------------------------
// ----------      Modal For the timer settings      ----------
// ------------------------------------------------------------


export const TimerSettingModal: ReactComponent<{
    modalRef: React.RefObject<BottomSheetModalMethods>;
    currentTimer: number,
    currentRecall: number
    setTimer: React.Dispatch<React.SetStateAction<number>>;
    setRecall: React.Dispatch<React.SetStateAction<number>>;
    onClose: () => void;
}> = ({ modalRef, currentTimer, currentRecall, setTimer, setRecall, onClose }) => {

    return (
        <ModalContainer modalRef={modalRef}>
            <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{t('showtime:rmt_ctl_set_timer_title')}</TText>
                </TView>


                <TText>{currentTimer}</TText>

                <FancyButton backgroundColor='subtext0' m='md' onPress={onClose} outlined testID='lang-sel-close-button'>
                    {t('todo:close_btn')}
                </FancyButton>
            </>
        </ModalContainer>
    );
};