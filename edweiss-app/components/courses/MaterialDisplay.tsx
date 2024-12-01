import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { iconSizes } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { Material, MaterialType } from '@/model/school/courses';
import { getIconName, getIconTestID, getTestID, getTextTestID } from '@/utils/courses/materialDisplay';
import { Time } from '@/utils/time';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


// Icons
export const icons: { [key: string]: IconType } = {
    slidesIcon: 'albums-outline',
    exerciseIcon: 'document-text-outline',
    feedbackIcon: 'arrow-undo-outline',
    otherIcon: 'attach-outline',
};

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

        const fromDate: Date = Time.dateFromSeconds(fromSeconds)
        const toDate: Date = Time.dateFromSeconds(toSeconds)

        const formatterOptions: Intl.DateTimeFormatOptions = {
            month: 'short',
            day: 'numeric',
        };

        const fromDateFormatted = new Intl.DateTimeFormat(t(`course:dateFormat`), formatterOptions).format(fromDate)
        const toDateFormatted = new Intl.DateTimeFormat(t(`course:dateFormat`), formatterOptions).format(toDate)

        return `${fromDateFormatted} - ${toDateFormatted}`
    };

    // Type-safe order mapping
    const order: Record<MaterialType, number> = {
        slides: 1,
        exercises: 2,
        other: 3,
        feedbacks: 4,
    };

    // Sort using the type-safe order mapping
    const sortedDocs = item.docs.sort((a, b) => {
        return order[a.type] - order[b.type];
    });

    return (
        <TView mt={10} mb={10}>
            <TText testID={testIDs.materialTitle} mb={10} size={18} color='darkBlue' bold>{item.title}</TText>
            <TText testID={testIDs.materialTitle} mb={4} size={14} color='darkBlue' bold>{formatDateRange(item.from.seconds, item.to.seconds)}</TText>
            <TText testID={testIDs.materialDescription} lineHeight='md' align='auto' size={15} color='darkNight' py={12} textBreakStrategy='highQuality'>{item.description}</TText>

            {sortedDocs.map((doc) => (
                <TTouchableOpacity
                    key={doc.url}
                    testID={getTestID(doc.type)}
                    flexDirection="row"
                    alignItems="center"
                    py={10}
                    mb={10}
                    bb={1}
                    borderColor="crust"
                    onPress={() => console.log(`Click on ${item.title}`)}
                >
                    <Icon
                        testID={getIconTestID(doc.type)}
                        name={getIconName(doc.type)}
                        size={iconSizes.md}
                    />
                    <TText
                        testID={getTextTestID(doc.type)}
                        size={16}
                        ml={10}
                    >
                        {doc.title}
                    </TText>
                </TTouchableOpacity>
            ))}
        </TView>
    );
}

export default MaterialDisplay;