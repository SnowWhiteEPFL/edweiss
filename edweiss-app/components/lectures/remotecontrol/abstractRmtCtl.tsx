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
import React from 'react';



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
    return (
        <>
            <RouteHeader disabled title={"Lecture's Slides"} />

            <TView borderColor='text' m={'md'} mt={'xl'} mb={'xl'} b={0.5} backgroundColor='base' radius={'lg'}>
                <TView mt={20} mb={50} justifyContent='center' alignItems='center'>
                    <TText size={18} mb={'md'}> {t(`showtime:showtime_title`)}</TText>
                    <TTouchableOpacity mt={20} backgroundColor='mantle' radius={'lg'}>
                        <TText size={50} p={'md'} pb={'sm'}>0:00:00</TText>
                    </TTouchableOpacity>
                </TView>

                <TView mr={20} ml={20} flexDirection='row' justifyContent='space-between'>
                    <TTouchableOpacity backgroundColor='surface0' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleLeft} testID='prev-button'>
                        <Icon size={85} name='chevron-back-outline' color='text'></Icon>
                    </TTouchableOpacity>
                    <TTouchableOpacity backgroundColor='surface0' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleRight} testID='next-button'>
                        <Icon size={85} name='chevron-forward-outline' color='text'></Icon>
                    </TTouchableOpacity>
                </TView>

                <TView mt={20} mb={10} justifyContent='center' alignItems='center'>
                    <TTouchableOpacity backgroundColor={isRecording ? 'red' : 'base'} borderColor={isRecording ? 'base' : 'red'} b={5} p={10} radius={1000} onPress={handleMic} testID='mic-button'>
                        <Icon size={55} name='mic-outline' color={isRecording ? 'base' : 'red'}></Icon>
                    </TTouchableOpacity>

                    {isRecording ? (
                        <TText mt={25} size={15} color='red'> {t(`showtime:recording_start`)} </TText>
                    ) : (
                        <TText mt={25} size={15} color='green'> {t(`showtime:tap_to_start_recording`)} </TText>
                    )}

                    <TView mt={10} flexDirection='row' justifyContent='space-between' >
                        <TTouchableOpacity backgroundColor='crust' borderColor='base' p={7} mt={0} radius={1000} onPress={() => console.log('SETTING')} testID='strc-setting-button'>
                            <Icon size={45} name='settings-outline' color='text'></Icon>
                        </TTouchableOpacity>

                        <TTouchableOpacity backgroundColor='crust' borderColor='base' p={7} radius={1000} onPress={() => console.log('SETTING')} testID='strc-chat-button'>
                            <Icon size={45} name='chatbubbles-outline' color='text'></Icon>
                        </TTouchableOpacity>

                    </TView>

                </TView>

            </TView>
        </>
    );
};
