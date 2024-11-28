import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { Color } from '@/constants/Colors';
import { iconSizes } from '@/constants/Sizes';
import { Course, Section } from '@/model/school/courses';
import { ProfessorID, StudentID } from '@/model/users';
import { t } from 'i18next';
import React from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import FancyButton from '../input/FancyButton';
import FancyTextInput from '../input/FancyTextInput';


// Icons
const nameIcon = 'text';
const descriptionIcon = 'create-outline';

// Tests Tags
export const testIDs = {

};


interface SelectActionsAnimatedProps {
    course: { id: string, data: Course };
    onFinish: () => void;
}


/**
 * AddMaterial Component
 * 
 * This component is responsible for displaying actions options to be selected when the teacher 
 * wants to add assignments or materials to the course.
 * 
 * 
 * @returns JSX.Element - The rendered component for the actions selection animation.
 */
const CourseParameters: ReactComponent<SelectActionsAnimatedProps> = ({ course, onFinish }) => {

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
    // mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}

    return (
        <TView flex={1} p={20} backgroundColor='mantle'>
            <TTouchableOpacity alignItems="flex-start" onPress={() => { onFinish() }}>
                <Icon name={'close'} size={iconSizes.lg} color="blue" mr={8} />
            </TTouchableOpacity>

            <TText size={24} bold mb={20} mx='md' pt={20}>{t(`course:course_params`)}</TText>
            <TText mx='md' mb={15}>{t(`course:course_params_title`)}</TText>

            <TScrollView>
                <TView>
                    <FancyTextInput
                        label={t(`course:material_title_label`)}
                        value={name}
                        onChangeText={n => setName(n)}
                        placeholder={t(`course:material_title_placeholder`)}
                        icon={nameIcon}
                    />
                    <FancyTextInput
                        label={t(`course:material_description_label`)}
                        value={description}
                        onChangeText={n => setDescription(n)}
                        placeholder={t(`course:material_description_placeholder`)}
                        icon={descriptionIcon}
                        multiline
                        numberOfLines={4}
                        mt={'md'}
                        mb={'sm'}
                    />
                    <FancyButton
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


                <TView flexDirection='row' justifyContent='center'>
                    <FancyButton
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
                        flexDirection='row'
                        b={1}
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
                        <TText mr={8} size={'sm'} color='overlay2'>
                            {t(`course:credits_label`)}
                        </TText>
                        <Icon name='pricetag' size={20} color='overlay0' mr={8} />
                        <TText ml={14} color='text'>{credits}</TText>
                    </TView>
                    <FancyButton
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
        </TView>
    );
};

export default CourseParameters;