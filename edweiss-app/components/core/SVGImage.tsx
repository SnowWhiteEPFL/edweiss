import t from '@/config/i18config';
import ReactComponent from '@/constants/Component';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { SvgProps, SvgXml } from 'react-native-svg';
import { AdditionalProps } from 'react-native-svg/lib/typescript/xml';
import TText from './TText';

export type SVGImageProps = { uri: string } & SvgProps & AdditionalProps;

/**
 * SVGImage Component
 * 
 * This component is responsible for fetching and displaying an SVG image from a given URI.
 * 
 * @param uri - The URI of the SVG image to fetch and display.
 * @returns JSX.Element - The rendered SVG image component.
 */
const SVGImage: ReactComponent<SVGImageProps> = ({ uri, width, height, color, title, onError, onLoad, fallback }) => {

    const [svgData, setSvgData] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchSvg = async () => {
            try {
                const response = await fetch(uri);
                const svgText = await response.text();
                setSvgData(svgText);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching SVG: ', error);
                console.debug(svgData);
                setLoading(false);
            }
        };

        fetchSvg();
    }, [uri]);

    if (loading) {
        return <ActivityIndicator testID='activityIndicatorId' size="large" />;
    }

    if (!svgData) {
        return <TText testID='errorText'>{t(`common:errorOccurred`)}</TText>;
    }

    return <SvgXml
        testID='svgXmlId'
        xml={svgData}
        width={width}
        height={height}
        color={color}
        title={title}
        onError={onError}
        onLoad={onLoad}
        fallback={fallback}
    />; // SVG Image
};

export default SVGImage;