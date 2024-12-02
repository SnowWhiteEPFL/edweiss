import { icons, testIDs } from '@/components/courses/MaterialDisplay';
import { IconType } from '@/constants/Style';
import { MaterialType } from '@/model/school/courses';

export const getTestID = (type: MaterialType): string => {
    const mapping = {
        slides: testIDs.slidesTouchable,
        exercises: testIDs.exercisesTouchable,
        feedbacks: testIDs.feedbacksTouchable,
        other: testIDs.otherTouchable,
    };
    return mapping[type] || testIDs.otherTouchable;
};

export const getIconName = (type: MaterialType): IconType => {
    const mapping = {
        slides: icons.slidesIcon,
        exercises: icons.exerciseIcon,
        feedbacks: icons.feedbackIcon,
        other: icons.otherIcon,
    };
    return mapping[type] || icons.otherIcon;
};

export const getIconTestID = (type: MaterialType): string => {
    const mapping = {
        slides: testIDs.slidesIcon,
        exercises: testIDs.exercisesIcon,
        feedbacks: testIDs.feedbacksIcon,
        other: testIDs.otherIcon,
    };
    return mapping[type] || testIDs.otherIcon;
};

export const getTextTestID = (type: MaterialType): string => {
    const mapping = {
        slides: testIDs.slidesText,
        exercises: testIDs.exercisesText,
        feedbacks: testIDs.feedbacksText,
        other: testIDs.otherText,
    };
    return mapping[type] || testIDs.otherText;
};