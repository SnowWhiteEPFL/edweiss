import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import FancyButton from '@/components/input/FancyButton';
import { ApplicationRoute } from '@/constants/Component';
import { Image } from 'expo-image';
import { pdf } from "pdf-to-img";
import React, { useEffect, useState } from 'react';

const Slide: ApplicationRoute = () => {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState<number>(0);

    // Function to convert buffer to base64 and add data URI format
    const bufferToBase64 = (buffer: Buffer) => {
        const base64String = buffer.toString('base64');
        return `data:image/png;base64,${base64String}`;  // Assuming the image format is PNG
    };

    async function loadAsImages() {
        const document = await pdf("@/assets/pdfs/test2.pdf", { scale: 3 });
        const imageList: string[] = [];
        for await (const image of document) {
            const base64Image = bufferToBase64(image);  // Convert buffer to base64 string
            imageList.push(base64Image);  // Store the base64 image
        }
        setImages(imageList);
        setLoading(false);
    }

    function pageforward() {
        page >= images.length ? undefined : setPage(page + 1);
    }

    function pageBack() {
        page == 0 ? undefined : setPage(page - 1);
    }

    // Load images when the component mounts
    useEffect(() => {
        loadAsImages();
    }, []);

    return (
        <>
            <RouteHeader title={"Lecture's Slides"} />
            <TView flexDirection='row'>
                {loading ? <TActivityIndicator></TActivityIndicator> :
                    <TView mb={'md'} mr={'xl'}>
                        <FancyButton icon='arrow-back-circle-outline' onPress={pageBack}></FancyButton>
                        <Image source={{ uri: images[page] }}/>
                        <FancyButton icon='arrow-forward-circle-outline' onPress={pageforward}></FancyButton>
                    </TView>
                }
            </TView>

        </>
    );
};