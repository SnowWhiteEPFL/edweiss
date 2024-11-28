import RouteHeader from '@/components/core/header/RouteHeader';

import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
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



                <TTouchableOpacity
                    mt={20} mr={'md'} ml={'md'} radius={'lg'} b={2}
                    style={{ borderColor: (lang === 'english') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'english') ? selectedColorBack : unselectedColorBack }}
                    onPress={() => setLang('english')}
                >
                    <TText size={'lg'} p={'md'}>{langIconMap["english"]}  {langNameMap["english"]}</TText>
                </TTouchableOpacity>

                <TTouchableOpacity
                    mt={20} mr={'md'} ml={'md'} radius={'lg'} b={2}
                    style={{ borderColor: (lang === 'french') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'french') ? selectedColorBack : unselectedColorBack }}
                    onPress={() => setLang('french')}
                >
                    <TText size={'lg'} p={'md'}>{langIconMap["french"]}  {langNameMap["french"]}</TText>
                </TTouchableOpacity>

                <TText ml={'md'} size={'lg'} bold>{t(`showtime:rmt_cntl_go_page`)}</TText>

                <TText>{langNameMap[lang]}</TText>

            </TScrollView>
        </>
    );
};

export default Route;
