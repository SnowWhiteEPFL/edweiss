import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { iconSizes } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { Course, Section, UpdateCourseArgs } from '@/model/school/courses';
import { ProfessorID, StudentID } from '@/model/users';
import React from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import FancyButton from '../input/FancyButton';
import FancyTextInput from '../input/FancyTextInput';


// Icons
export const icons: { [key: string]: IconType } = {
    nameIcon: 'text-outline',
    descriptionIcon: 'create-outline',
};

// Tests Tags
export const testIDs: { [key: string]: string } = {
    globalView: 'global-view',
    goBackOpacity: 'go-back-opacity',
    closeIcon: 'close-icon',
    title: 'title',
    message: 'message',
    scrollView: 'scroll-view',
    nameDescriptionSectionView: 'name-description-section-view',
    nameInput: 'name-input',
    descriptionInput: 'description-input',
    sectionInput: 'section-input',
    creditsComponentView: 'credits-component-view',
    descreaseCreidtsButton: 'descrease-credits-button',
    creditsView: 'credits-view',
    creditsTitle: 'credits-title',
    creditsIcon: 'credits-icon',
    creditsText: 'credits-text',
    increaseCreidtsButton: 'increase-credits-button',
    finishTouchableOpacity: 'finish-touchable-opacity',
    finishView: 'finish-view',
    finishIcon: 'finish-icon',
    finishText: 'finish-text',
};


interface CourseParamsProps {
    course: { id: string, data: Course };
    onGiveUp: () => void;
    onFinish: (course: UpdateCourseArgs) => void;
}


/**
 * CourseParameters Component
 * 
 * This component is responsible for editing the course parameters in the course page.
 * 
 * 
 * @returns JSX.Element - The rendered component for the actions selection animation.
 */
const CourseParameters: ReactComponent<CourseParamsProps> = ({ course, onGiveUp, onFinish }) => {

    const [name, setName] = React.useState<string>(course.data.name);
    const [description, setDescription] = React.useState<string>(course.data.description);
    const [section, setSection] = React.useState<Section>(course.data.section);
    const [credits, setCredits] = React.useState<number>(course.data.credits);
    const [professor, setProfessor] = React.useState<ProfessorID>("");
    const [assistant, setAssistant] = React.useState<StudentID>("");

    const sectionOptions: { section: Section, color: Color }[] = [
        { section: "IN", color: "cherry" },
        { section: "SC", color: "red" },
        { section: "MA", color: "maroon" },
        { section: "PH", color: "peach" },
        { section: "CGC", color: "yellow" },
        { section: "EL", color: "green" },
        { section: "GM", color: "teal" },
        { section: "MT", color: "sky" },
        { section: "MX", color: "sapphire" },
        { section: "SV", color: "blue" },
        { section: "AR", color: "lavender" },
        { section: "GC", color: "pink" },
        { section: "SIE", color: "mauve" }
    ];

    return (
        <TView testID={testIDs.globalView} flex={1} p={20} backgroundColor='mantle'>
            <TTouchableOpacity testID={testIDs.goBackOpacity} alignItems="flex-start" onPress={() => { onGiveUp() }}>
                <Icon testID={testIDs.closeIcon} name={'close'} size={iconSizes.lg} color="blue" mr={8} />
            </TTouchableOpacity>

            <TText testID={testIDs.title} size={24} bold mb={20} mx='md' pt={20}>{t(`course:course_params`)}</TText>
            <TText testID={testIDs.message} mx='md' mb={15}>{t(`course:course_params_title`)}</TText>

            <TScrollView testID={testIDs.scrollView}>
                <TView testID={testIDs.nameDescriptionSectionView}>
                    <FancyTextInput
                        testID={testIDs.nameInput}
                        label={t(`course:title_label`)}
                        value={name}
                        onChangeText={n => setName(n)}
                        placeholder={t(`course:title_placeholder`)}
                        icon={icons.nameIcon}
                    />
                    <FancyTextInput
                        testID={testIDs.descriptionInput}
                        label={t(`course:description_label`)}
                        value={description}
                        onChangeText={n => setDescription(n)}
                        placeholder={t(`course:description_placeholder`)}
                        icon={icons.descriptionIcon}
                        multiline
                        numberOfLines={4}
                        mt={'md'}
                        mb={'sm'}
                    />
                    <FancyButton
                        testID={testIDs.sectionInput}
                        onPress={() => {
                            setSection(sectionOptions[(sectionOptions.findIndex(option => option.section === section) + 1) % sectionOptions.length].section);
                        }}
                        backgroundColor={sectionOptions[sectionOptions.findIndex(option => option.section === section)].color}
                        textColor='constantWhite'
                        radius={'lg'}
                        mt={'md'}
                        mb={'sm'}
                    >
                        {section}
                    </FancyButton>
                </TView>


                <TView testID={testIDs.creditsComponentView} flexDirection='row' justifyContent='center'>
                    <FancyButton
                        testID={testIDs.descreaseCreidtsButton}
                        onPress={() => {
                            credits > 0 ? setCredits(credits - 1) : setCredits(0);
                        }}
                        backgroundColor={credits > 0 ? 'yellow' : 'base'}
                        icon='remove'
                        radius={'lg'}
                        mt={'md'}
                        mb={'sm'}
                        mx={-10}
                        disabled={credits <= 0}
                    />
                    <TView
                        testID={testIDs.creditsView}
                        flexDirection='row'
                        backgroundColor='crust'
                        radius={14}
                        alignItems='center'
                        justifyContent='center'
                        mt={'md'}
                        mb={'sm'}
                        mx={36}
                        px={20}
                        py={12}
                    >
                        <TText testID={testIDs.creditsTitle} mr={8} size={'sm'} color='overlay2'>
                            {t(`course:credits_label`)}
                        </TText>
                        <Icon testID={testIDs.creditsIcon} name='pricetag' size={20} color='overlay0' mr={8} />
                        <TText testID={testIDs.creditsText} ml={14} color='text'>{credits}</TText>
                    </TView>
                    <FancyButton
                        testID={testIDs.increaseCreidtsButton}
                        onPress={() => {
                            credits < 30 ? setCredits(credits + 1) : setCredits(30);
                        }}
                        backgroundColor={credits < 30 ? 'yellow' : 'base'}
                        icon='add'
                        radius={'lg'}
                        mt={'md'}
                        mb={'sm'}
                        mx={-10}
                        disabled={credits >= 30}
                    />
                </TView>
            </TScrollView>

            <TTouchableOpacity
                testID={testIDs.finishTouchableOpacity}
                backgroundColor={(name === "") ? 'text' : 'blue'}
                disabled={name === ""}
                onPress={() => { onFinish({ name, description, credits, section }); }}
                ml={100} mr={100} p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
                <TView testID={testIDs.finishView} flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon testID={testIDs.finishIcon} name={icons.finishIcon} color='base' size={'md'} />
                    <TText testID={testIDs.finishText} color='base' ml={10}>{t(`course:update_changes`)}</TText>
                </TView>
            </TTouchableOpacity >
        </TView>
    );
};

export default CourseParameters;