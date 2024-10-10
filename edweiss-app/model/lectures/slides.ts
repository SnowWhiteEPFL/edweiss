import { FunctionFolder, FunctionOf } from '../functions';

namespace SlidesDisplay {

    export interface PdfPageImage {
        uri?: string;
        path?: string;
        index: number;
    }
    export type PdfPage = PdfPageImage;

    export interface Slides {
        images: PdfPage[];
    }
}

export default SlidesDisplay;
