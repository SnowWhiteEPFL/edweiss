import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import FancyButton from '@/components/input/FancyButton';
import { ApplicationRoute } from '@/constants/Component';
import SlidesDisplay from '@/model/lectures/slides';
import React, { useEffect, useState } from 'react';
import Pdf from 'react-native-pdf'; // Import react-native-pdf

const Slide: ApplicationRoute = () => {
    const [numPages, setNumPages] = useState<number>(0);  // Number of pages in the PDF
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

    function loadPdf(){
        const imgList: SlidesDisplay.PdfPage[] = [];
        let count = 0;
        imgList.push({ uri: '@/assets/pdfs/test2.pdf',  index: count});
        count++;
        setImages({images: imgList});
    }

    // Load images when the component mounts
    useEffect(() => {
        loadPdf();
    }, []);

    return (
        <>
            <RouteHeader title={"Lecture's Slides"} />
            <TView>
                {loading ? (
                    <TActivityIndicator />  // Show loading indicator while the PDF loads
                ) : (
                    <TView mb={'md'} mr={'xl'} flexDirection='row'>
                        <FancyButton icon='arrow-back-circle-outline' onPress={pageBack} />

                        <Pdf
                            source={{ uri: images?.images[0].uri }}  // PDF file source
                            onLoadComplete={(numberOfPages) => {
                                setNumPages(numberOfPages);
                                setLoading(false);  // Stop loading once PDF is loaded
                            }}
                            onPageChanged={(page, numberOfPages) => {
                                console.log(`Current page: ${page} / ${numberOfPages}`);
                            }}
                            page={page}  // Display the current page
                        />

                        <FancyButton icon='arrow-forward-circle-outline' onPress={pageForward} />
                    </TView>
                )}
            </TView>
        </>
    );
};

export default Slide;