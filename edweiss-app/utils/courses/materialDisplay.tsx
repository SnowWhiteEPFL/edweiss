import { icons, testIDs } from '@/components/courses/MaterialDisplay';
import { IconType } from '@/constants/Style';
import { MaterialType } from '@/model/school/courses';

export const getTestID = (type: MaterialType): string => {
    const mapping = {
        slide: testIDs.slideTouchable,
        exercise: testIDs.exerciseTouchable,
        image: testIDs.imageTouchable,
        feedback: testIDs.feedbackTouchable,
        other: testIDs.otherTouchable,
    };
    return mapping[type] || testIDs.otherTouchable;
};

export const getIconName = (type: MaterialType): IconType => {
    const mapping = {
        slide: icons.slideIcon,
        exercise: icons.exerciseIcon,
        image: icons.imageIcon,
        feedback: icons.feedbackIcon,
        other: icons.otherIcon,
    };
    return mapping[type] || icons.otherIcon;
};

export const getIconTestID = (type: MaterialType): string => {
    const mapping = {
        slide: testIDs.slideIcon,
        exercise: testIDs.exerciseIcon,
        image: testIDs.imageIcon,
        feedback: testIDs.feedbackIcon,
        other: testIDs.otherIcon,
    };
    return mapping[type] || testIDs.otherIcon;
};

export const getTextTestID = (type: MaterialType): string => {
    const mapping = {
        slide: testIDs.slideText,
        exercise: testIDs.exerciseText,
        image: testIDs.imageText,
        feedback: testIDs.feedbackText,
        other: testIDs.otherText,
    };
    return mapping[type] || testIDs.otherText;
};