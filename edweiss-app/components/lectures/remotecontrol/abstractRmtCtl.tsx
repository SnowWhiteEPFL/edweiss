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

            <TView mt={100} mb={100} justifyContent='center' alignItems='center'>
                <TText size={25} mb={'md'}> {t(`showtime:showtime_title`)}</TText>
                <TText size={35} >{t(`showtime:rmt_cntl_title`)}</TText>
                {isRecording ? (
                    <TText mt={15} size={15} color='red'> {t(`showtime:recording_start`)} </TText>
                ) : (
                    <TText mt={15} size={15} color='green'> {t(`showtime:tap_to_start_recording`)} </TText>
                )}
            </TView>

            <TView mr={20} ml={20} flexDirection='row' justifyContent='space-between'>
                <TTouchableOpacity backgroundColor='blue' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleLeft} testID='prev-button'>
                    <Icon size={70} name='chevron-back-outline' color='base'></Icon>
                </TTouchableOpacity>
                <TTouchableOpacity backgroundColor='blue' borderColor='surface0' b={1} p={20} pt={60} pb={60} radius={'lg'} onPress={handleRight} testID='next-button'>
                    <Icon size={70} name='chevron-forward-outline' color='base'></Icon>
                </TTouchableOpacity>
            </TView>

            <TView mt={70} mb={30} justifyContent='center' alignItems='center'>
                <TTouchableOpacity backgroundColor={isRecording ? 'red' : 'base'} borderColor={isRecording ? 'base' : 'red'} b={5} p={10} radius={1000} onPress={handleMic} testID='mic-button'>
                    <Icon size={70} name='mic-outline' color={isRecording ? 'base' : 'red'}></Icon>
                </TTouchableOpacity>
            </TView>
        </>
    );
};
