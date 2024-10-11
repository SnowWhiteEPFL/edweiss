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
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking } from 'react-native';
import Pdf from 'react-native-pdf';

const Slide: ApplicationRoute = () => {
    const [numPages, setNumPages] = useState<number>(0);  // Number of pages in the PDF
    const [page, setPage] = useState<number>(0);  // Current page, starting from 1
    //const [images, setImages] = useState<SlidesDisplay.Slides>();  // Loading state
    const [url, setUrl] = useState<string>('');  // Loading state
    const [goToQuiz, setGoToQuiz] = useState<boolean>(false);
    const [width, setWidth] = useState<number>(100);
    const [height, setHeight] = useState<number>(100);

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
    }, []);

    return (

        <>
            <RouteHeader title={"Lecture's Slides"} />
            <TView mb={'xl'} flexDirection='row'>

                <TView flexDirection='column' justifyContent='space-between'>
                    <TTouchableOpacity backgroundColor='base' onPress={pageBack}>
                        <Icon size={'xl'} name={'arrow-up-circle-outline'} dark='text'></Icon>
                    </TTouchableOpacity>

                    <TText color='red'>{page}/{numPages}</TText>

                    <TTouchableOpacity backgroundColor='base' onPress={pageForward}>
                        <Icon size={'xl'} name={'arrow-down-circle-outline'} dark='text'></Icon>
                    </TTouchableOpacity>
                </TView>

                <Pdf
                    trustAllCerts={false}
                    source={{ uri: url }}
                    renderActivityIndicator={() =>
                        <ActivityIndicator size={'large'} />
                    }
                    enablePaging={true}
                    //onLoadProgress={(percentage) => console.log(`Loading : ${percentage}`)}
                    onLoadComplete={(totalPages, path, { width, height }) => {
                        setWidth(width * 0.5);
                        setHeight(height * 0.5);
                        setNumPages(totalPages);
                    }}
                    onPageChanged={(page, totalPages) => {
                        setPage(page);
                        (page == 3) ? setGoToQuiz(true) : setGoToQuiz(false);
                    }}
                    onError={(error) => console.log(error)}
                    //onPageSingleTap={(page) => console.log(page)}
                    onPressLink={(link) => Linking.openURL(link)}
                    page={page}
                    style={{ flex: 1, width: width, height: height }} />
            </TView>
            <TView>{goToQuiz ? <FancyButton backgroundColor='red' onPress={() => console.log("Go to quiz")}></FancyButton> : <TView></TView>}</TView>

            <TView flexDirection='row' style={{ height: "100%" }}>
                <TScrollView flex={0.7} b={'sm'} mr={'md'}>
                    <FancyTextInput label='Ask your questions' mt={'xl'} icon='chatbubbles-outline'></FancyTextInput>
                </TScrollView>
                <TScrollView b={'sm'} >
                    <TText> Speech to Text here</TText>
                </TScrollView>
            </TView>
        </>
    );
};

export default Slide;