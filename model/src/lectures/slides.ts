import { FunctionFolder, FunctionOf } from '../functions';

namespace SlidesDisplay {

    export interface PdfPageImage {
        uri: string;
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
}

export default SlidesDisplay;
