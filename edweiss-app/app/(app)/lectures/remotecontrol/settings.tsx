import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import { langIconMap, langNameMap } from '@/utils/lectures/remotecontrol/utilsFunctions';
import { t } from 'i18next';

const Route: ApplicationRoute = () => {


    /* Color pallette for selected/unselected languages
     * Note: this are `sky` and `green` in which there alpha has been modified
     */
    const selectedColorBord = 'rgba(4, 165, 229, 0.15)';
    const selectedColorBack = 'rgba(4, 165, 229, 0.01)';
    const unselectedColorBord = 'rgba(64, 160, 43, 0.6)';
    const unselectedColorBack = 'rgba(64, 160, 43, 0.1)';
    return (
        <>
            <RouteHeader title={t(`showtime:rmt_cntl_setting_title`)} />

            <TScrollView>
                <TText ml={'md'} size={'lg'} bold>{t(`showtime:rmt_cntl_lang_section`)}</TText>

                <TTouchableOpacity mt={20} mr={'md'} ml={'md'} radius={'lg'} b={2} style={{ borderColor: selectedColorBord, backgroundColor: selectedColorBack }}>
                    <TText size={'xl'} p={'md'} pb={'sm'}>{langIconMap["english"]}  {langNameMap["english"]}</TText>
                </TTouchableOpacity>

                <TTouchableOpacity mt={20} mr={'md'} ml={'md'} radius={'lg'} b={2} style={{ borderColor: unselectedColorBord, backgroundColor: unselectedColorBack }}>
                    <TText size={'xl'} p={'md'} pb={'sm'}>{langIconMap["french"]}  {langNameMap["french"]}</TText>
                </TTouchableOpacity>

                <TText ml={'md'} size={'lg'} bold>{t(`showtime:rmt_cntl_go_page`)}</TText>


            </TScrollView>
        </>
    );
};

export default Route;
