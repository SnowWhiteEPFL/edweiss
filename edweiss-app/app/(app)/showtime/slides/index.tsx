import { ApplicationRoute } from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import SlidesDisplay from '@/model/lectures/slides';
import React, { useState } from 'react';

const Slide: ApplicationRoute = () => {
    const [currentPage, setCurrentPage] = useState(1);  // Tracks the current page
    const [pdfSlides, setPdfSlides] = useState<SlidesDisplay.Slides | null>(null); // Store the loaded slides

    async function call() {
        const res = await callFunction(SlidesDisplay.Functions.loadSlide, {
            slide: {
                images: [{
                    image: { uri: "", width: 1, height: 1 },
                    page: currentPage
                }]
            }
        });
    }

    return (
        <>
            <RouteHeader title={"PDF"} />
           
        </>
    );
};