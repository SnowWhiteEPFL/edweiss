import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';
import SlidesDisplay from '@/model/lectures/slides';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Linking, View } from 'react-native';
import Pdf from 'react-native-pdf';

const Slide: ApplicationRoute = () => {
    const [numPages, setNumPages] = useState<number>(10);  // Number of pages in the PDF
    const [page, setPage] = useState<number>(1);  // Current page, starting from 1
    const [loading, setLoading] = useState<boolean>(true);  // Loading state
    const [images, setImages] = useState<SlidesDisplay.Slides>();  // Loading state

    // Function to go to the next page
    function pageForward() {
        if (page < numPages) setPage(page + 1);
    }

    // Function to go to the previous page
    function pageBack() {
        if (page > 1) setPage(page - 1);
    }

    function loadPdf() {
        const imgList: SlidesDisplay.PdfPage[] = [];
        let count = 0;
        imgList.push({ path: 'https://api.printnode.com/static/test/pdf/multipage.pdf', index: count });
        setImages({ images: imgList });
        console.log(images?.images[0].path);
        setLoading(false);
    }

    // Load images when the component mounts
    useEffect(() => {
        loadPdf();
    }, []);

    return (

        <>
            <RouteHeader title={"Lecture's Slides"} />
            <View style={{
                flex: 1,
                justifyContent: "flex-start",
                alignItems: "center"
            }}>
                <Pdf
                    trustAllCerts={false}
                    source={{ uri: images?.images[0].path }}
                    spacing={1}
                    renderActivityIndicator={() =>
                        <ActivityIndicator size={'large'} />
                    }
                    enablePaging={true}
                    onLoadProgress={(percentage) => console.log(`Loading : ${percentage}`)}
                    onLoadComplete={() => console.log("Loading Complete")}
                    onPageChanged={(page, totalPages) => console.log(`${page}/${totalPages}`)}
                    onError={(error) => console.log(error)}
                    onPageSingleTap={(page) => console.log(page)}
                    onPressLink={(link) => Linking.openURL(link)}
                    page={page}
                    //horizontal
                    style={{ flex: 1, width: Dimensions.get('window').width }} />
            </View>



        </>
        //<RouteHeader title={"Lecture's Slides"} />


        //<TView>
        //    {loading ? (
        //        <TActivityIndicator />  // Show loading indicator while the PDF loads
        //    ) : (
        //<TView mb={'md'} mr={'xl'} flexDirection='row' justifyContent='flex-start'>
        //    <FancyButton icon='arrow-back-circle-outline' onPress={pageBack} />

        //    <Pdf
        //trustAllCerts={false}
        //        source={{ uri: 'file:///C:/Users/rdcma/Downloads/A%20leap%20into%20the%20past_%20Using%20Usenet.pdf' }}  // PDF file source
        // onLoadComplete={(numberOfPages) => {
        //    setNumPages(numberOfPages);
        //    setLoading(false);  // Stop loading once PDF is loaded
        //}}
        //onPageChanged={(page, numberOfPages) => {
        //    console.log(`Current page: ${page} / ${numberOfPages}`);
        //}}
        //page={page}  // Display the current page
        //    />

        //    <FancyButton icon='arrow-forward-circle-outline' onPress={pageForward} />
        //</TView>
        //    )}
        //</TView>
        //</>
    );
};

export default Slide;