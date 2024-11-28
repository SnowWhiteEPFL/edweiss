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


                <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>

                    <TTouchableOpacity
                        ml={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'english') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'english') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('english')}
                        testID='lang-but-english'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["english"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["english"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>

                    <TTouchableOpacity
                        mr={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'french') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'french') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('french')}
                        testID='lang-but-french'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["french"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["french"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>
                </TView>


                <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
                    <TTouchableOpacity
                        ml={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'german') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'german') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('german')}
                        testID='lang-but-german'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["german"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["german"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>

                    <TTouchableOpacity
                        mr={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'spanish') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'spanish') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('spanish')}
                        testID='lang-but-spanish'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["spanish"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["spanish"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>
                </TView>

                <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
                    <TTouchableOpacity
                        ml={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'italian') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'italian') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('italian')}
                        testID='lang-but-italian'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["italian"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["italian"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>

                    <TTouchableOpacity
                        mr={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'brazilian') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'brazilian') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('brazilian')}
                        testID='lang-but-brazilian'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["brazilian"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["brazilian"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>
                </TView>



                <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
                    <TTouchableOpacity
                        ml={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'arabic') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'arabic') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('arabic')}
                        testID='lang-but-arabic'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["arabic"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["arabic"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>

                    <TTouchableOpacity
                        mr={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'chinese') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'chinese') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('chinese')}
                        testID='lang-but-chinese'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["chinese"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["chinese"]}</TText>
                            </TView>
                        </TView>
                    </TTouchableOpacity>
                </TView>

                <TView alignItems='center' flexDirection='row' justifyContent='space-between' mt={20}>
                    <TTouchableOpacity
                        ml={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'vietanames') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'vietanames') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('vietanames')}
                        testID='lang-but-vietanames'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["vietanames"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["vietanames"]}</TText>
                            </TView>
                        </TView>

                    </TTouchableOpacity>

                    <TTouchableOpacity
                        mr={'sm'} radius={'lg'} b={2}
                        style={{ borderColor: (lang === 'hindi') ? selectedColorBord : unselectedColorBord, backgroundColor: (lang === 'hindi') ? selectedColorBack : unselectedColorBack, width: 160, height: 65 }}
                        onPress={() => setLang('hindi')}
                        testID='lang-but-hindi'
                    >
                        <TView alignItems='center' flexDirection='row' justifyContent='space-between' p={'md'}>
                            <TText size={'lg'} >{langIconMap["hindi"]}</TText>
                            <TView flex={1} alignItems='center'>
                                <TText size={'lg'} align='center'>{langNameMap["hindi"]}</TText>
                            </TView>
                        </TView>

                    </TTouchableOpacity>
                </TView>



                <TText ml={'md'} size={'lg'} bold>{t(`showtime:rmt_cntl_go_page`)}</TText>

                <TText>{langNameMap[lang]}</TText>

            </TScrollView>
        </>
    );
};

export default Route;
