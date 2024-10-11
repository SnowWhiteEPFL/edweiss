import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { getDownloadURL } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import useListenToMessages from '@/hooks/useListenToMessages';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking } from 'react-native';
import Pdf from 'react-native-pdf';

const Slide: ApplicationRoute = () => {
    const [numPages, setNumPages] = useState<number>(0);  // Number of pages in the PDF
    const [page, setPage] = useState<number>(0);  // Current page, starting from 1
    //const [images, setImages] = useState<SlidesDisplay.Slides>();  // Loading state
    const [url, setUrl] = useState<string>('');  // Loading state
    const [goToQuiz, setGoToQuiz] = useState<boolean>(false);
    const [screenOrientation, setScreenOrientation] = useState(ScreenOrientation.Orientation.PORTRAIT_UP);

    useListenToMessages((msg) => {
        if (msg.type == "go_to_slide") {
            setPage(msg.slideIndex);
        }
    });

    const setLandscape = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    };
    const setPortrait = async () => {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
    };

    // Function to go to the next page
    function pageForward() {
        if (page < numPages) setPage(page + 1);
    }

    // Function to go to the previous page
    function pageBack() {
        if (page > 1) setPage(page - 1);
    }

    // Funtion to set Url to the desired one from firebase storage
    async function getUrl() {
        setUrl(await getDownloadURL('China-101.pdf'));
    }

    /*
    function loadPdf() {
        const imgList: SlidesDisplay.PdfPage[] = [];
        let count = 0;
        imgList.push({ path: 'https://api.printnode.com/static/test/pdf/multipage.pdf', index: count });
        setImages({ images: imgList });
        console.log(images?.images[0].path);
        setLoading(false);
    }*/

    // Load images when the component mounts
    useEffect(() => {
        getUrl();
        setLandscape();
    }, []);

    return (

        <>
            <RouteHeader title={"Lecture's Slides"} />
            <TView flexDirection='row' flex={1} style={{ width: "100%" }}>
                <TView mr={'lg'} flexDirection='column' flex={1}>
                    <Pdf
                        trustAllCerts={false}
                        source={{ uri: url }}
                        renderActivityIndicator={() =>
                            <ActivityIndicator size={'large'} />
                        }
                        enablePaging={true}
                        //onLoadProgress={(percentage) => console.log(`Loading : ${percentage}`)}
                        onLoadComplete={(totalPages) => setNumPages(totalPages)}
                        onPageChanged={(page) => {
                            setPage(page);
                            (page == 3) ? setGoToQuiz(true) : setGoToQuiz(false);
                        }}
                        onError={(error) => console.log(error)}
                        //onPageSingleTap={(page) => console.log(page)}
                        onPressLink={(link) => Linking.openURL(link)}
                        page={page}
                        horizontal
                        style={{ flex: 1, width: Dimensions.get('window').height, height: 10 }} />

                    <TView flexDirection='row' justifyContent='space-between'>
                        <TTouchableOpacity backgroundColor='base' onPress={pageBack}>
                            <Icon size={'xl'} name={'arrow-back-circle-outline'} dark='text'></Icon>
                        </TTouchableOpacity>

                        <TText color='red'>{page}/{numPages}</TText>

                        <TTouchableOpacity backgroundColor='base' onPress={pageForward}>
                            <Icon size={'xl'} name={'arrow-forward-circle-outline'} dark='text'></Icon>
                        </TTouchableOpacity>
                    </TView>
                </TView>

                <TView>{goToQuiz ? <FancyButton backgroundColor='red' onPress={() => console.log("Go to quiz")}></FancyButton> : <TView></TView>}</TView>

                <TView flexDirection='column' style={{ width: "50%" }}>
                    <TScrollView b={'sm'} mb={'md'} >
                        <TText> Speech to Text here</TText>
                    </TScrollView>
                    <TScrollView flex={0.5} b={'xs'} mb={'md'}>
                        <FancyTextInput label='Ask your questions' mt={'xl'} icon='chatbubbles-outline'></FancyTextInput>
                    </TScrollView>
                </TView>
            </TView>
        </>
    );
};

export default Slide;