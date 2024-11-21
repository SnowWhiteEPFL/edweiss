import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { iconSizes } from '@/constants/Sizes';
import { Material } from '@/model/school/courses';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


// Icons
const slidesIcon = 'albums-outline';
const exerciseIcon = 'document-text-outline';
const feedbackIcon = 'arrow-undo-outline';
const otherIcon = 'attach-outline';

// Tests Tags
export const testIDs = {
    materialTitle: 'material-title',
    materialDescription: 'material-description',
    slidesTouchable: 'slides-touchable',
    slidesIcon: 'slides-icon',
    slidesText: 'slides-text',
    exercisesTouchable: 'exercises-touchable',
    exercisesIcon: 'exercises-icon',
    exercisesText: 'exercises-text',
    otherTouchable: 'other-touchable',
    otherIcon: 'others-icon',
    otherText: 'other-text',
    feedbacksTouchable: 'feedbacks-touchable',
    feedbacksIcon: 'feedbacks-icon',
    feedbacksText: 'feedbacks-text',
};

/**
 * MaterialDisplay Component
 * 
 * This component is responsible for displaying a material in the course page.
 * 
 * @param item - The material data to be displayed.
 * @param key - The key of the assignment in the list.
 * 
 * @returns JSX.Element - The rendered component for the assignment display.
 */
const MaterialDisplay: ReactComponent<{ item: Material; }> = ({ item }) => {

    const formatDateRange = (fromSeconds: number, toSeconds: number) => {
        const fromDate = new Date(fromSeconds * 1000);
        const toDate = new Date(toSeconds * 1000);

        const formatterOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
        const fullYearFormatterOptions: Intl.DateTimeFormatOptions = { ...formatterOptions, year: 'numeric' };

        const fromDateString = new Intl.DateTimeFormat('en-US', formatterOptions).format(fromDate);
        const toDateString = new Intl.DateTimeFormat('en-US', fullYearFormatterOptions).format(toDate);

        return `${fromDateString} - ${toDateString}`;
    };

    const sortedDocs = item.docs.sort((a, b) => {
        const order = { slides: 1, exercises: 2, other: 3, feedbacks: 4 };
        return (order[a.type] || 5) - (order[b.type] || 5);
    });

    return (
        <TView mt={10} mb={10}>
            <TText testID={testIDs.materialTitle} mb={10} size={18} color='darkBlue' bold>{item.title}</TText>
            <TText testID={testIDs.materialTitle} mb={4} size={14} color='darkBlue' bold>{formatDateRange(item.from.seconds, item.to.seconds)}</TText>
            <TText testID={testIDs.materialDescription} lineHeight='md' align='auto' size={15} color='darkNight' py={12} textBreakStrategy='highQuality'>{item.description}</TText>

            {sortedDocs.map((doc, index) => {
                return (
                    <TTouchableOpacity key={index} testID={doc.type === 'slides' ? testIDs.slidesTouchable : doc.type === 'exercises' ? testIDs.exercisesTouchable : doc.type === 'feedbacks' ? testIDs.feedbacksTouchable : testIDs.otherTouchable} flexDirection='row' alignItems='center' py={10} mb={10} bb={1} borderColor='crust' onPress={() => console.log(`Clic on ${item.title}`)}>
                        <Icon
                            testID={doc.type === 'slides' ? testIDs.slidesIcon : doc.type === 'exercises' ? testIDs.exercisesIcon : doc.type === 'other' ? testIDs.otherIcon : testIDs.feedbacksIcon}
                            name={doc.type === 'slides' ? slidesIcon : doc.type === 'exercises' ? exerciseIcon : doc.type === 'other' ? otherIcon : feedbackIcon}
                            size={iconSizes.md}
                        />
                        <TText
                            testID={doc.type === 'slides' ? testIDs.slidesText : doc.type === 'exercises' ? testIDs.exercisesText : doc.type === 'other' ? testIDs.otherText : testIDs.feedbacksText}
                            size={16}
                            ml={10}
                        >
                            {doc.title}
                        </TText>
                    </TTouchableOpacity>
                );
            })}
        </TView>
    );
}

export default MaterialDisplay;