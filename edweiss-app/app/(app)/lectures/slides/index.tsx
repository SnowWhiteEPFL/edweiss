import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { ApplicationRoute } from '@/constants/Component';

import { useLocalSearchParams } from 'expo-router';

import React, { useState } from 'react';



const LectureScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;


    // Hooks
    const [numPages, setNumPages] = useState<number>(0);  // Total number of pages in the PDF
    const [page, setPage] = useState<number>(0);  // Current page, starting from 1
    const [uri, setUri] = useState<string>('');  // Url state
    //const [isLandscape, setIsLandscape] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false); // FullScreen display of pdf toggle


    // Load images when the component mounts


    // Function to go to the next page
    function pageForward() {
        if (page < numPages) setPage(page + 1);
    }
    // Function to go to the previous page
    function pageBack() {
        if (page > 1) setPage(page - 1);
    }

    // Funtion to set Uri to the desired one from firebase storage



    return (
        //Screen Display on landscape mode
        <>

            <RouteHeader disabled title={"Lecture's Slides"} />


            <TView flexDirection={'row'} flex={1} style={{ width: "100%" }}>


                <TView mr={'lg'} flexDirection='column' style={{ width: isFullscreen ? "100%" : "60%" }}>

                    <TView flexDirection='row' justifyContent='space-between' >
                        {/* Buttons for page change and fullScreen toggle */}

                        <TView flexDirection='row' justifyContent='space-between' pr={'sm'} pl={'sm'}>
                            <TTouchableOpacity backgroundColor='transparent' onPress={pageBack} pr={'md'}>
                                <Icon size={'xl'} name='arrow-back-circle-outline' color='text'></Icon>
                            </TTouchableOpacity>

                            <TTouchableOpacity backgroundColor='transparent' onPress={pageForward} pl={'md'}>
                                <Icon size={'xl'} name='arrow-forward-circle-outline' color='text'></Icon>
                            </TTouchableOpacity>

                        </TView>

                        <TTouchableOpacity backgroundColor='transparent' onPress={() => setIsFullscreen(!isFullscreen)}>
                            <Icon size={'xl'} name={isFullscreen ? 'contract-outline' : 'expand-outline'} dark='text'></Icon>
                        </TTouchableOpacity>
                    </TView>
                </TView >

                <TView flexDirection='column' style={{ width: isFullscreen ? "0%" : "40%" }}>
                    {isFullscreen ?
                        <TView></TView> : // Speech to Text translation display and question forum display
                        <>
                            <TScrollView b={'sm'} m={'lg'}>
                                <TText> some text</TText>
                            </TScrollView>
                            <TScrollView flex={0.5} b={'xs'} mb={'md'}>
                                <FancyTextInput label='Ask your questions' mt={'xl'} icon='chatbubbles-outline' />
                            </TScrollView>
                        </>}
                </TView>
            </TView >
        </>
    );
};

export default LectureScreen;