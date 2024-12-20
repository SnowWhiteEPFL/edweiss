import ReactComponent from '@/constants/Component';

import { DocumentRouteSignature } from '@/app/(app)/courses/[id]/materials/[materialId]';
import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { iconSizes } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { pushWithParameters } from '@/hooks/routeParameters';
import { CourseID, Material, MaterialID, MaterialType } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { router } from 'expo-router';
import React, { RefObject } from 'react';
import { ProgressPopupHandle } from '../animations/ProgressPopup';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import DocumentDisplay from './DocumentDisplay';


// Icons
export const icons: { [key: string]: IconType } = {
    slideIcon: 'albums-outline',
    exerciseIcon: 'document-text-outline',
    imageIcon: 'image-outline',
    feedbackIcon: 'arrow-undo-outline',
    otherIcon: 'attach-outline',
};

// Tests Tags
export const testIDs = {
    materialTitle: 'material-title',
    materialDescription: 'material-description',
    slideTouchable: 'slide-touchable',
    slideIcon: 'slide-icon',
    slideText: 'slide-text',
    exerciseTouchable: 'exercise-touchable',
    exerciseIcon: 'exercise-icon',
    exerciseText: 'exercise-text',
    imageTouchable: 'other-touchable',
    imageIcon: 'others-icon',
    imageText: 'other-text',
    otherTouchable: 'other-touchable',
    otherIcon: 'others-icon',
    otherText: 'other-text',
    feedbackTouchable: 'feedback-touchable',
    feedbackIcon: 'feedback-icon',
    feedbackText: 'feedback-text',
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
const MaterialDisplay: ReactComponent<{
    item: Material,
    courseId: CourseID,
    materialId: MaterialID,
    isTeacher?: boolean,
    onTeacherClick?: () => void;
    handle?: ProgressPopupHandle;
    aiGenerateDeck?: (materialUrl: string) => Promise<void>,
    aiGenerateQuiz?: (materialUrl: string) => Promise<void>,
    modalRef?: RefObject<BottomSheetModalMethods>

}> = ({ item, courseId, materialId, isTeacher = false, onTeacherClick, handle, aiGenerateDeck, aiGenerateQuiz, modalRef }) => {

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
        slide: 1,
        exercise: 2,
        image: 3,
        other: 4,
        feedback: 5,
    };

    // Sort using the type-safe order mapping
    const sortedDocs = item.docs.sort((a, b) => {
        return order[a.type] - order[b.type];
    });

    return (
        <TView mt={10} mb={10}>
            <TView flexDirection='row' justifyContent='space-between'>
                <TText testID={testIDs.materialTitle} mb={10} size={18} color='darkBlue' bold>{item.title}</TText>
                {isTeacher && <TTouchableOpacity testID='editMaterial' onPress={onTeacherClick}>
                    <Icon testID='editMaterialIcon' name='create' size={iconSizes.md} color='blue' />
                </TTouchableOpacity>}
            </TView>
            <TText testID={testIDs.materialTitle} mb={4} size={14} color='darkBlue' bold>{formatDateRange(item.from.seconds, item.to.seconds)}</TText>
            <TText testID={testIDs.materialDescription} lineHeight='md' align='auto' size={15} color='darkNight' py={12} textBreakStrategy='highQuality'>{item.description}</TText>

            {sortedDocs.map((doc) => (
                <DocumentDisplay doc={doc} isTeacher={isTeacher} onDelete={undefined} key={doc.uri} onPress={async () => {
                    if (aiGenerateDeck && handle) {
                        // Check if doc.uri ends with .pdf
                        if (doc.uri.toLowerCase().endsWith('.pdf')) {
                            handle.start()
                            await aiGenerateDeck(`courses/${courseId}/materials/${materialId}/${doc.uri}`)
                            handle.stop()

                            router.back()
                        }

                    } else if (aiGenerateQuiz && handle) {
                        if (doc.uri.toLowerCase().endsWith('.pdf')) {
                            handle.start()
                            await aiGenerateQuiz(`courses/${courseId}/materials/${materialId}/${doc.uri}`)
                            handle.stop()

                        }
                    } else {
                        pushWithParameters(DocumentRouteSignature, { courseId: courseId, materialId: materialId, document: doc })
                    }
                }} />
            ))}

        </TView>
    );
}

export default MaterialDisplay;