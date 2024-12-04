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
import Icon from '@/components/core/Icon';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { LightDarkProps } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import useTheme from '@/hooks/theme/useTheme';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { t } from 'i18next';
import React, { useState } from 'react';
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

    const [tmpTimer, setTmpTimer] = useState(currentTimer);
    const [tmpRecall, setTmpRecall] = useState(currentRecall);

    const getTimerSeconds = (seconds: number) => {
        return `0${seconds % 60}`.slice(-2);
    }

    const getTimerMinute = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        return `0${minutes % 60}`.slice(-2);
    }

    const getTimerHour = (seconds: number) => {
        return `0${Math.floor(seconds / 3600)}`.slice(-1);

    }

    return (
        <ModalContainer modalRef={modalRef}>
            <>
                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{t('showtime:rmt_ctl_set_timer_title')}</TText>
                </TView>



                <TView mt={'sm'}>


                    <TView flexDirection='row' justifyContent='space-between' mb={'md'} >
                        <TView flexDirection='row' justifyContent='space-between' flex={1} mt={'xs'}>

                            <TText ml={'md'} mt={'md'} size={'lg'}>Timer</TText>

                            <TTouchableOpacity ml={'lg'} radius={'md'} borderColor='text' b={1} justifyContent='center' pr={'md'} pl={'md'}>
                                <TText size={'lg'}>{getTimerHour(tmpTimer)}</TText>
                            </TTouchableOpacity>

                            <TText size={'xl'} pt={'lg'}>:</TText>

                            <TTouchableOpacity radius={'md'} borderColor='text' b={1} justifyContent='center' pr={'md'} pl={'md'}>
                                <TText size={'lg'}>{getTimerMinute(tmpTimer)}</TText>
                            </TTouchableOpacity>

                            <TText size={'xl'} pt={'lg'} >:</TText>

                            <TTouchableOpacity mr={'lg'} radius={'md'} borderColor='text' b={1} justifyContent='center' pr={'md'} pl={'md'}>
                                <TText size={'lg'}>{getTimerSeconds(tmpTimer)}</TText>
                            </TTouchableOpacity>
                        </TView>

                    </TView>


                    <TView flexDirection='row' justifyContent='space-between' mb={'md'} mt={'sm'}>
                        <TView flexDirection='row' justifyContent='space-between' flex={1} mt={'xs'}>

                            <TText ml={'md'} mt={'md'} size={'lg'}>Recall</TText>

                            <TTouchableOpacity ml={'lg'} radius={'md'} borderColor='text' b={1} justifyContent='center' pr={'md'} pl={'md'}>
                                <TText size={'lg'}>{getTimerHour(tmpTimer)}</TText>
                            </TTouchableOpacity>

                            <TText size={'xl'} pt={'lg'}>:</TText>

                            <TTouchableOpacity radius={'md'} borderColor='text' b={1} justifyContent='center' pr={'md'} pl={'md'}>
                                <TText size={'lg'}>{getTimerMinute(tmpTimer)}</TText>
                            </TTouchableOpacity>

                            <TText size={'xl'} pt={'lg'} >:</TText>

                            <TTouchableOpacity mr={'lg'} radius={'md'} borderColor='text' b={1} justifyContent='center' pr={'md'} pl={'md'}>
                                <TText size={'lg'}>{getTimerSeconds(tmpTimer)}</TText>
                            </TTouchableOpacity>
                        </TView>

                    </TView>


                    <TView flex={1} />


                    {/* <TText mt={'md'} ml={'lg'} mr={'lg'} size={'lg'} testID='timer-val-status'>Timer: {formatTime(tmpTimer)}</TText> */}

                    <TView flexDirection='row' justifyContent='space-between' mb={'sm'} mt={'sm'}>

                        <TView flex={1} />

                        <TTouchableOpacity
                            ml={'xl'}
                            backgroundColor='crust'
                            borderColor='text' p={'sm'} b={1} radius={1000}
                            onPress={() => setTmpTimer(tmpTimer - 1)}
                            testID='dec-timer-button'>
                            <Icon size={50} name='remove-circle-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1} />



                        <TTouchableOpacity
                            mr={'xs'}
                            backgroundColor='crust'
                            borderColor='text' p={'sm'} b={1} radius={1000}
                            onPress={() => setTmpTimer(tmpTimer + 1)}
                            testID='add-timer-button'>
                            <Icon size={50} name='add-circle-outline' color='text'></Icon>
                        </TTouchableOpacity>


                        <TView flex={1} />
                    </TView>
                </TView>


                <FancyButton icon='stopwatch-outline' mt={'lg'} m='md' mb={0} onPress={() => { setTimer(tmpTimer); setRecall(tmpRecall); onClose() }} outlined testID='lang-sel-close-button'>
                    {t('showtime:rmt_ctl_set_it_up')}
                </FancyButton>

                <FancyButton backgroundColor='subtext0' m='md' onPress={onClose} outlined testID='lang-sel-close-button'>
                    {t('todo:close_btn')}
                </FancyButton>
            </>
        </ModalContainer >
    );
};