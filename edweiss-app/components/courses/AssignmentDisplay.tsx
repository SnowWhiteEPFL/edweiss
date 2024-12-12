import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { iconSizes } from '@/constants/Sizes';
import { dateFormats, timeInMS } from '@/constants/Time';
import { Assignment, AssignmentID, CourseID } from '@/model/school/courses';
import { saveTodo } from '@/utils/courses/saveToDo';
import { router } from 'expo-router';
import { useCallback, useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


// Icons
const submissionIcon = 'clipboard-outline';
const quizIcon = 'help-circle-outline';

// Tests Tags
export const testIDs = {
    swipeableComponent: 'swipeable-component',
    swipeViewRight: 'swipe-view-right',
    addToDoText: 'add-to-todo-text',
    swipeViewLeft: 'swipe-view-left',
    editText: 'edit-text',
    assignmentView: 'assignment-view',
    assignmentTouchable: 'assignment-touchable',
    assignmentIcon: 'assignment-icon',
    assignmentTitleView: 'assignment-title-view',
    assignmentTitle: 'assignment-title',
    assignmentDate: 'assignment-date',
};

export type AssignmentWithColor = Assignment & { color: Color; };


/**
 * AssignmentDisplay Component
 * 
 * This component is responsible for displaying an assignment in the course page.
 * It is a swipeable component that allows the user to add the assignment to the todo list.
 * 
 * @param item - The assignment data to be displayed.
 * @param index - The index of the assignment in the list.
 * @param backgroundColor - The background color of the assignment card.
 * @param defaultColor - The default color of the assignment icon.
 * @param swipeableRefs - A reference to the swipeable component.
 * 
 * @returns JSX.Element - The rendered component for the assignment display.
 */
const AssignmentDisplay: ReactComponent<{ item: AssignmentWithColor, id: AssignmentID, courseID: CourseID, isTeacher?: boolean, index: number, isSwipeable?: boolean, onSwipeLeft?: () => void; }> = ({ item, id, courseID, isTeacher = false, index, isSwipeable = false, onSwipeLeft }) => {

    // Define swipeableRefs
    const swipeableRefs = useRef<(Swipeable | null)[]>([]);

    // Render right actions on swipe
    const renderRightActions = () => (
        <TView testID={testIDs.swipeViewRight} justifyContent='center' alignItems='flex-end' px={14} backgroundColor='green'>
            <TText testID={testIDs.addToDoText} size={16} bold color='constantWhite'>{t(`course:add_to_todo`)}</TText>
        </TView>
    );

    const renderLeftActions = () => (
        <TView testID={testIDs.swipeViewLeft} justifyContent='center' alignItems='flex-start' px={26} backgroundColor='blue'>
            <TText testID={testIDs.editText} size={16} bold color='constantWhite'>{t(`course:edit`)}</TText>
        </TView>
    );

    const assignmentView = () => (
        <TView testID={testIDs.assignmentView} flexDirection='row' alignItems="center" justifyContent='space-between'>
            {/* TODO: Handle onPress event qui envoie vers le quiz ou la soumission. ATTENTION SI LE QUIZ OU SUBMIT EST DEJA FINI */}
            <TTouchableOpacity testID={testIDs.assignmentTouchable} disabled={item.type !== 'quiz'} onPress={item.type === 'quiz' ? () => router.push({ pathname: `/(app)/quiz/quizStudentView`, params: { quizId: id, courseId: courseID } }) : undefined} backgroundColor='mantle' flexDirection='row' alignItems='center' py={12} bb={1} borderColor='crust' flex={1}>
                {/* // Icon */}
                <Icon testID={testIDs.assignmentIcon} name={item.type as string === 'submission' ? submissionIcon : quizIcon} size={iconSizes.lg} color={item.color} />
                {/* // Assignment name */}
                <TView testID={testIDs.assignmentTitleView} flex={1}><TText testID={testIDs.assignmentTitle} size={16} color={item.color} mx='md' >{item.name}</TText></TView>
                {/* // Due date */}
                <TText testID={testIDs.assignmentDate} align='right' size={14} color={item.color} >
                    {new Date(item.dueDate.seconds * timeInMS.SECOND).toLocaleDateString(t(`course:dateFormat`), dateFormats)}
                </TText>
            </TTouchableOpacity>
        </TView>
    );

    // Extract the `onSwipeableOpen` handler
    const handleSwipeableOpen = useCallback(
        (direction: string) => {
            if (direction === 'right') {
                console.log(`Swipe detected on assignment: ${item.name}`);
                saveTodo(item.name, item.dueDate, item.type);
                swipeableRefs.current[index]?.close();
            }
            if (direction === 'left') {
                console.log(`Swipe detected on assignment: ${item.name}`);
                if (onSwipeLeft) onSwipeLeft();
                swipeableRefs.current[index]?.close();
            }
        },
        [item, saveTodo, swipeableRefs, index]
    );

    // Extract the swipeable rendering logic
    const renderSwipeable = useCallback(() => {
        return (
            <Swipeable
                testID={testIDs.swipeableComponent}
                ref={(ref) => {
                    swipeableRefs.current[index] = ref;
                }}
                renderRightActions={renderRightActions}
                renderLeftActions={isTeacher ? renderLeftActions : undefined}
                onSwipeableOpen={handleSwipeableOpen}
            >
                {assignmentView()}
            </Swipeable>
        );
    }, [assignmentView, renderRightActions, handleSwipeableOpen, swipeableRefs, index]);

    return isSwipeable ? renderSwipeable() : assignmentView();
};

export default AssignmentDisplay;