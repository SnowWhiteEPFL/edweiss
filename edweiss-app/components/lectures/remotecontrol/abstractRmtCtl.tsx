/**
 * @file abstractRmtCtl.tsx
 * @description The abstract remote control decouple from all the bussiness 
 *              function from processing the audio input and slide change.
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { LightDarkProps } from '@/constants/Colors';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { langIconMap } from '@/utils/lectures/remotecontrol/utilsFunctions';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { LangSelectModal } from './modal';

// types
type AvailableLangs = LectureDisplay.AvailableLangs;




// ------------------------------------------------------------
// ----------    Abstract Remote Control Component  -----------
// ------------------------------------------------------------
interface AbstractRmtCrlProps {
    handleRight: () => void;
    handleLeft: () => void;
    handleMic: () => void;
    isRecording: boolean;
    lang: AvailableLangs;
    setLang: (lang: AvailableLangs) => void;
    curPageProvided: number;
    totPageProvided: number;
    courseNameString: string;
    lectureIdString: string;

}

export const AbstractRmtCrl: React.FC<AbstractRmtCrlProps & LightDarkProps> = ({ handleRight, handleLeft, handleMic, isRecording, lang, setLang, curPageProvided, totPageProvided, courseNameString, lectureIdString }) => {

    // Modal References
    const modalRefLangSelect = useRef<BottomSheetModal>(null);


    const [timer, setTimer] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;
        if (isRunning) {
            interval = setInterval(() => {
                setTimer(prevTimer => prevTimer + 1);
            }, 1000);
        } else if (!isRunning && timer !== 0) {
            clearInterval(interval!);
        }
        return () => clearInterval(interval!);
    }, [isRunning, timer]);

    const formatTime = (seconds: number) => {
        const getSeconds = `0${seconds % 60}`.slice(-2);
        const minutes = Math.floor(seconds / 60);
        const getMinutes = `0${minutes % 60}`.slice(-2);
        const getHours = `0${Math.floor(seconds / 3600)}`.slice(-1);
        return `${getHours}:${getMinutes}:${getSeconds}`;
    };

    return (
        <>
            <RouteHeader disabled title={"Lecture's Slides"} />

            <TView borderColor='text' m={'md'} mt={'xl'} mb={'xl'} b={0.5} backgroundColor='base' radius={'lg'}>

                {/* STRC text, set language and timer */}
                <TView mt={17} mb={50} justifyContent='center' alignItems='center'>
                    <TText size={18} mt={'sm'} mb={'sm'}> {t(`showtime:showtime_title`)}</TText>

                    <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>

                        {/* Language Selection */}
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='text' p={10} b={1} ml={'md'} radius={1000}
                            onPress={() => modalRefLangSelect.current?.present()}
                            testID='strc-lang-button'>
                            <Icon size={40} name='language-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

                        {/* The Stop Watch */}
                        <TTouchableOpacity
                            backgroundColor='mantle'
                            borderColor='text'
                            b={1}
                            radius={'lg'}
                            mr={'lg'}
                            testID='timer-but'
                            onPress={() => setIsRunning(!isRunning)}
                        >
                            <TText
                                size={50}
                                style={{ width: 200, height: 70, paddingTop: 40, paddingLeft: 10 }}
                                testID='timer-txt'>
                                {formatTime(timer)}
                            </TText>
                        </TTouchableOpacity>

                    </TView>

                </TView>


                {/* Prev / Next navigation buttons */}
                <TView mr={20} ml={20} flexDirection='row' justifyContent='space-between'>
                    <TTouchableOpacity backgroundColor='surface0' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleLeft} testID='prev-button'>
                        <Icon size={85} name='chevron-back-outline' color='text'></Icon>
                    </TTouchableOpacity>
                    <TTouchableOpacity backgroundColor='surface0' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleRight} testID='next-button'>
                        <Icon size={85} name='chevron-forward-outline' color='text'></Icon>
                    </TTouchableOpacity>
                </TView>


                <TView mt={20} mb={10} justifyContent='center' alignItems='center'>
                    {/* Recording button and text  */}
                    <TTouchableOpacity backgroundColor={isRecording ? 'red' : 'base'} borderColor={isRecording ? 'base' : 'red'} b={5} p={10} radius={1000} onPress={handleMic} testID='mic-button'>
                        <Icon size={55} name='mic-outline' color={isRecording ? 'base' : 'red'}></Icon>
                    </TTouchableOpacity>

                    {isRecording ? (
                        <TText mt={25} size={15} color='red'>{langIconMap[lang]} {t(`showtime:recording_start`)} </TText>
                    ) : (
                        <TText mt={25} size={15} color='green'> {t(`showtime:tap_to_start_recording`)} </TText>
                    )}


                    {/* End buttons */}
                    <TView mt={15} alignItems='center' flexDirection='row' justifyContent='space-between'>

                        {/* Jump to Slide button */}
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='text' p={10} b={1} ml={'md'} radius={1000}
                            onPress={() => {
                                router.push({
                                    pathname: '/(app)/lectures/remotecontrol/jumpToSlide' as any,
                                    params: {
                                        courseNameString,
                                        lectureIdString,
                                        currentPageString: curPageProvided.toString(),
                                        totalPageString: totPageProvided.toString(),
                                    },
                                })
                            }}
                            testID='strc-go-to-button'>
                            <Icon size={40} name='rocket-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

                        {/* Lecture Activities */}
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='text' p={10} b={1} radius={1000}
                            onPress={() => Toast.show({
                                type: 'success',
                                text1: 'The Available activities',
                                text2: 'Implementation comes soon'
                            })}
                            testID='strc-activity-button'>
                            <Icon size={40} name='easel-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

                        {/* Andiance Questions */}
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='text' p={10} b={1} mr={'md'} radius={1000}
                            onPress={() => Toast.show({
                                type: 'success',
                                text1: 'The Audiance  Questions',
                                text2: 'Implementation comes soon'
                            })}
                            testID='strc-chat-button'>
                            <Icon size={40} name='chatbubbles-outline' color='text'></Icon>
                        </TTouchableOpacity>

                    </TView>

                </TView>

            </TView>

            {/* Modals */}
            <LangSelectModal modalRef={modalRefLangSelect} lang={lang} setLang={setLang} onClose={() => modalRefLangSelect.current?.close()} />
        </>
    );
};
