/**
 * @file abstract.tsx
 * @description The abstract remote control decouple from all the bussiness 
 * function from processing the audio input and slide change.
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
import { router } from 'expo-router';
import React, { useState } from 'react';
import Toast from 'react-native-toast-message';

// types
import AvailableLangs = LectureDisplay.AvailableLangs;




// ------------------------------------------------------------
// ------------   Abstract Remote Control Screen  -------------
// ------------------------------------------------------------
interface AbstractRmtCrlProps {
    handleRight: () => void;
    handleLeft: () => void;
    handleMic: () => void;
    isRecording: boolean;
}

export const AbstractRmtCrl: React.FC<AbstractRmtCrlProps & LightDarkProps> = ({ handleRight, handleLeft, handleMic, isRecording }) => {

    // The selected language, by default en-US
    const [selectedLanguage, setSelectedLanguage] = useState<AvailableLangs>('english');

    return (
        <>
            <RouteHeader disabled title={"Lecture's Slides"} />

            <TView borderColor='text' m={'md'} mt={'xl'} mb={'xl'} b={0.5} backgroundColor='base' radius={'lg'}>

                {/* STRC text and timer */}
                <TView mt={17} mb={50} justifyContent='center' alignItems='center'>
                    <TText size={18} mb={'md'}> {t(`showtime:showtime_title`)}</TText>
                    <TTouchableOpacity mt={20} backgroundColor='mantle' radius={'lg'}>
                        <TText size={50} p={'md'} pb={'sm'}>0:00:00</TText>
                    </TTouchableOpacity>
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
                        <TText mt={25} size={15} color='red'> {t(`showtime:recording_start`)} </TText>
                    ) : (
                        <TText mt={25} size={15} color='green'> {t(`showtime:tap_to_start_recording`)} </TText>
                    )}


                    {/* End buttons for settigs, activities and audiance questions */}
                    <TView mt={15} alignItems='center' flexDirection='row' justifyContent='space-between'>
                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='base' p={7} ml={'md'} radius={1000}
                            onPress={() => router.push({
                                pathname: '/(app)/lectures/remotecontrol/settings',
                                params: { selectedLanguage, setSelectedLanguage }
                            } as any)}
                            testID='strc-setting-button'>
                            <Icon size={45} name='settings-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='base' p={7} mr={'md'} radius={1000}
                            onPress={() => Toast.show({
                                type: 'success',
                                text1: 'The Available activities',
                                text2: 'Implementation comes soon'
                            })}
                            testID='strc-chat-button'>
                            <Icon size={45} name='easel-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TView flex={1}></TView>

                        <TTouchableOpacity
                            backgroundColor='crust'
                            borderColor='base' p={7} mr={'md'} radius={1000}
                            onPress={() => Toast.show({
                                type: 'success',
                                text1: 'The Audiance  Questions',
                                text2: 'Implementation comes soon'
                            })}
                            testID='strc-chat-button'>
                            <Icon size={45} name='chatbubbles-outline' color='text'></Icon>
                        </TTouchableOpacity>

                    </TView>

                </TView>

            </TView>
        </>
    );
};
