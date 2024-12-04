/**
 * @file jumpToSlide.tsx
 * @description The Jump to slide handler to avoid having to press multiple times 
 *              and prev / next buttons 
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { CollectionOf, getDownloadURL } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { router, useLocalSearchParams } from 'expo-router';
import { t } from 'i18next';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions } from 'react-native';
import Pdf from 'react-native-pdf';
import Toast from 'react-native-toast-message';

// Types
type Lecture = LectureDisplay.Lecture;
type Question = LectureDisplay.Question;

// ------------------------------------------------------------
// --------------------  Lecture Screen  ----------------------
// ------------------------------------------------------------

const JumpToSlideScreen: ApplicationRoute = () => {
    const { courseNameString, lectureIdString, currentPageString, totalPageString } = useLocalSearchParams();
    const courseName = courseNameString as string;
    const lectureId = lectureIdString as string;
    const providedTotalPage = parseInt(totalPageString as any, 10);
    const providedCurrentPage = parseInt(currentPageString as any, 10);

    // Hooks
    const [numPages, setNumPages] = useState<number>(providedTotalPage);
    const [page, setPage] = useState<number>(providedCurrentPage);
    const [currentPage, setCurrentPage] = useState<number>(providedCurrentPage);  // Track swiped or active page
    const [uri, setUri] = useState<string>('');                                   // Url state

    const [inputPage, setInputPage] = useState<string>("");

    const handlePageChange = () => {
        const pageNumber = parseInt(inputPage, 10);
        if (pageNumber >= 1 && pageNumber <= numPages) {
            setPage(pageNumber);
            setCurrentPage(pageNumber);
        } else {
            Toast.show({
                type: 'info',
                text1: t(`showtime:rmt_cntl_inv_page_toast`),
                text2: t(`showtime:rmt_cntl_inv_page_toast_funny`)
            });
            setInputPage("");
        }
    };


    const [lectureDoc] = usePrefetchedDynamicDoc(CollectionOf<Lecture>(`courses/${courseName}/lectures`), lectureId, undefined);

    // Load images when the component mounts
    useEffect(() => {
        if (lectureDoc?.data.pdfUri) {
            getUri();
        }
    }, [lectureDoc]);

    useEffect(() => {
        setInputPage("")
    }, [currentPage])





    if (!lectureDoc) return <TActivityIndicator size={40} testID='activity-indicator' />;
    const currentLecture = lectureDoc.data;

    // Function to go to the next page
    function incPageCount() {
        if (currentPage < numPages) { setPage(currentPage + 1); setCurrentPage(currentPage + 1); }
    }
    // Function to go to the previous page
    const decPageCount = () => {
        if (currentPage > 1) { setPage(currentPage - 1); setCurrentPage(currentPage - 1); }
    };

    // Funtion to set Uri to the desired one from firebase storage
    const getUri = async () => {
        try {
            const url = await getDownloadURL(currentLecture.pdfUri);
            setUri(url);
        } catch (error) {
            console.error('Error loading PDF URL:', error);
        }
    };

    const PDFViewer = (uri: string, widthPorp: number, heightProp: number) => (
        <Pdf
            trustAllCerts={false}
            source={{ uri }}
            renderActivityIndicator={() => <ActivityIndicator size="large" />}
            enablePaging
            onLoadComplete={(totalPages) => setNumPages(totalPages)}
            onPageChanged={(currentPage) => setCurrentPage(currentPage)}
            onError={(error) => console.log(error)}
            page={page}
            horizontal
            style={{
                flex: 1,
                width: Dimensions.get('window').width * widthPorp,
                height: Dimensions.get('window').height * heightProp,
            }}
        />
    );



    return (
        <>

            <RouteHeader title={t('showtime:rmt_cntl_jmp_to_page')} />

            {/* The Swipable Slides  */}
            <TView mt={'md'} mb={'md'} flexDirection='column' style={{ width: '100%', height: '33%', position: 'relative' }} >
                {PDFViewer(uri, 1, 1)}
            </TView>

            {/* The Switch Buttons */}
            <TView flexDirection='row' justifyContent='space-between' mb={'md'} >
                <TView flex={1} />

                <TTouchableOpacity
                    backgroundColor='crust'
                    borderColor='text' p={'sm'} b={1} radius={1000}
                    onPress={decPageCount}
                    testID='dec-page-button'>
                    <Icon size={50} name='remove-circle-outline' color='text'></Icon>
                </TTouchableOpacity>

                <TView flex={1} />

                <TText mt={'md'} ml={'lg'} mr={'lg'} size={'xl'}>{currentPage} / {numPages}</TText>

                <TView flex={1} />

                <TTouchableOpacity
                    backgroundColor='crust'
                    borderColor='text' p={'sm'} b={1} radius={1000}
                    onPress={incPageCount}
                    testID='add-page-button'>
                    <Icon size={50} name='add-circle-outline' color='text'></Icon>
                </TTouchableOpacity>


                <TView flex={1} />
            </TView>


            {/* Input Page go to page */}
            <TView p={'sm'} mr={'md'} ml={'md'} radius={'lg'}>
                <FancyTextInput
                    value={inputPage}
                    onChangeText={setInputPage}
                    placeholder={t('showtime:rmt_ctl_enter_page_placeholder')}
                    icon='newspaper'
                    label={t('showtime:rmt_ctl_enter_page_label')}
                    testID='pick-page-input'
                    numeric
                />


                <FancyButton m='sm' backgroundColor='sapphire' icon='compass' mb={0} onPress={handlePageChange} testID='set-page-button'>
                    {t('showtime:rmt_cntl_pick_page')}
                </FancyButton>

            </TView>



            {/* Go to page Button  */}
            <FancyButton icon='paper-plane' mt='lg' m='md' onPress={() => { console.log('going to page ' + currentPage); router.back(); }} testID='go-to-button'>
                {t('showtime:rmt_cntl_go_page')}
            </FancyButton >

        </>
    );
};

export default JumpToSlideScreen;