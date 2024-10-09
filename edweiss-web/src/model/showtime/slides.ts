import { FunctionFolder, FunctionOf } from '../functions';

namespace SlidesDisplay {

    export interface PdfPageImage {
       url: string;
       height: number;
       width: number;
    }

    export type PdfPage = PdfPageImage;

    export interface Image {
        image: PdfPage,
        page: number;
    }

    export interface Slides {
        images: Image[];
    }

    export const Functions = FunctionFolder("slides", {
        load: FunctionFolder("load", {
            loadSlide: FunctionOf<{ slide: SlidesDisplay.Slides; }, { id: string; }, 'empty_PDF'>("loadSlide"),
        })
    });
}

export default SlidesDisplay;
