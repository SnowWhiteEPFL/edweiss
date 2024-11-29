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
import React, { useRef } from 'react';
import Toast from 'react-native-toast-message';
import LangSelectModal from './modal';

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

}

export const AbstractRmtCrl: React.FC<AbstractRmtCrlProps & LightDarkProps> = ({ handleRight, handleLeft, handleMic, isRecording, lang, setLang }) => {


    const modalRefLangSelect = useRef<BottomSheetModal>(null);

    return (
        <>
            <RouteHeader disabled title={"Lecture's Slides"} />

            <TView borderColor='text' m={'md'} mt={'xl'} mb={'xl'} b={0.5} backgroundColor='base' radius={'lg'}>

                {/* STRC text, set language and timer */}
                <TView mt={17} mb={50} justifyContent='center' alignItems='center'>
                    <TText size={18} mt={'sm'} mb={'sm'}> {t(`showtime:showtime_title`)}</TText>

                    <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='text' p={10} b={1} ml={'md'} radius={1000}
                            onPress={() => modalRefLangSelect.current?.present()}
                            testID='strc-lang-button'>
                            <Icon size={40} name='language-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

                        <TTouchableOpacity backgroundColor='mantle' borderColor='text' b={1} radius={'lg'} mr={'md'} testID='timer-but'>
                            <TText size={50} p={'md'} pb={'sm'} testID='timer-txt'>0:00:00</TText>
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


                    {/* End buttons for settings, activities and audiance questions */}
                    <TView mt={15} alignItems='center' flexDirection='row' justifyContent='space-between'>
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='text' p={10} b={1} ml={'md'} radius={1000}
                            onPress={() => Toast.show({
                                type: 'success',
                                text1: 'The Go to Page',
                                text2: 'Implementation comes soon'
                            })}
                            testID='strc-go-to-button'>
                            <Icon size={40} name='rocket-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

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
