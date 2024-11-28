import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import { t } from 'i18next';

const Route: ApplicationRoute = () => {


    return (
        <>
            <RouteHeader title={t(`showtime:rmt_cntl_setting_title`)} />

            <TView>
                <TText>{t(`showtime:rmt_cntl_lang_section`)}</TText>


            </TView>
        </>
    );
};

export default Route;
