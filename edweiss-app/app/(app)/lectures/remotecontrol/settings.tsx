import RouteHeader from '@/components/core/header/RouteHeader';

import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import { ApplicationRoute } from '@/constants/Component';
import LectureDisplay from '@/model/lectures/lectureDoc';
import { langIconMap, langNameMap } from '@/utils/lectures/remotecontrol/utilsFunctions';
import { t } from 'i18next';
import { useState } from 'react';

//type
import AvailableLangs = LectureDisplay.AvailableLangs;


const Route: ApplicationRoute = () => {


    /* Color pallette for selected/unselected languages
     * Note: this are `sky` and `green` in which there alpha has been modified
     */

    const unselectedColorBord = 'rgba(4, 165, 229, 0.15)';
    const unselectedColorBack = 'rgba(4, 165, 229, 0.01)';
    const selectedColorBord = 'rgba(64, 160, 43, 0.6)';
    const selectedColorBack = 'rgba(64, 160, 43, 0.1)';


    const [lang, setLang] = useState<AvailableLangs>('english');

    return (
        <>
            <RouteHeader title={t(`showtime:rmt_cntl_setting_title`)} />

            <TScrollView>
                <TText ml={'md'} size={'lg'} bold>{t(`showtime:rmt_cntl_lang_section`)}</TText>


                {(['english', 'french', 'german', 'spanish', 'italian', 'brazilian', 'arabic', 'chinese', 'vietanames', 'hindi'] as AvailableLangs[]).map((language, index, array) => {
                    if (index % 2 === 0 && index + 1 < array.length) {
                        return (
                            <TwoLangsSelection
                                key={language}
                                lang={lang}
                                setLang={setLang}
                                lang1={language}
                                lang2={array[index + 1]}
                            />
                        );
                    }
                    return null;
                })}

                <TText ml={'md'} size={'lg'} bold>{t(`showtime:rmt_cntl_go_page`)}</TText>

                <TText>{langNameMap[lang]}</TText>

            </TScrollView>
        </>
    );
};

export default Route;


interface TwoLangsSelectionProps {
    lang: AvailableLangs;
    setLang: (lang: AvailableLangs) => void;
    lang1: AvailableLangs;
    lang2: AvailableLangs;
}

const TwoLangsSelection: React.FC<TwoLangsSelectionProps> = ({ lang, setLang, lang1, lang2 }) => {
    const unselectedColorBord = 'rgba(4, 165, 229, 0.15)';
    const unselectedColorBack = 'rgba(4, 165, 229, 0.01)';
    const selectedColorBord = 'rgba(64, 160, 43, 0.6)';
    const selectedColorBack = 'rgba(64, 160, 43, 0.1)';

    return (
        <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
            <TTouchableOpacity
                ml={'sm'} radius={'lg'} b={2}
                style={{ borderColor: (lang === lang1) ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === lang1) ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                onPress={() => setLang(lang1)}
                testID={`lang-but-${lang1}`}
            >
                <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                    <TText size={'lg'} >{langIconMap[lang1]}</TText>
                    <TView flex={1} alignItems='center'>
                        <TText size={'lg'} align='center'>{langNameMap[lang1]}</TText>
                    </TView>
                </TView>
            </TTouchableOpacity>

            <TTouchableOpacity
                mr={'sm'} radius={'lg'} b={2}
                style={{ borderColor: (lang === lang2) ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === lang2) ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                onPress={() => setLang(lang2)}
                testID={`lang-but-${lang2}`}
            >
                <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                    <TText size={'lg'} >{langIconMap[lang2]}</TText>
                    <TView flex={1} alignItems='center'>
                        <TText size={'lg'} align='center'>{langNameMap[lang2]}</TText>
                    </TView>
                </TView>
            </TTouchableOpacity>
        </TView>
    );
};