import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { iconSizes } from '@/constants/Sizes';
import { dateFormats, timeInMS } from '@/constants/Time';
import { Assignment } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { Time as OurTime } from '@/utils/time';
import { Timestamp } from '../../model/time';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';


// Icons
const submissionIcon = 'clipboard-outline';
const quizIcon = 'help-circle-outline';

// Tests Tags
export const testIDs = {
    swipeView: 'swipe-view',
    assignmentIcon: 'assignment-icon',
    assignmentTitle: 'assignment-title',
    assignmentDate: 'assignment-date'
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
const AssignmentDisplay: ReactComponent<{ item: AssignmentWithColor, index: number, isSwipeable: boolean; }> = ({ item, index, isSwipeable }) => {

    // Define swipeableRefs
    const swipeableRefs = useRef<(Swipeable | null)[]>([]);

    // Render right actions on swipe
    const renderRightActions = () => (
        <TView justifyContent='center' alignItems='flex-end' py={20} backgroundColor='green' testID={testIDs.swipeView}>
            <TText size={16} bold={true} color='constantWhite'>{t(`course:add_to_todo`)}</TText>
        </TView>
    );

    const assignmentView = () => (
        <TView flexDirection='row' alignItems="center" justifyContent='space-between'>
            {/* TODO: Handle onPress event qui envoie vers le quiz ou la soumission. ATTENTION SI LE QUIZ OU SUBMIT EST DEJA FINI */}
            <TTouchableOpacity backgroundColor='mantle' flexDirection='row' alignItems='center' py={12} bb={1} borderColor='crust' flex={1}>
                {/* // Icon */}
                <Icon name={item.type as string === 'submission' ? submissionIcon : quizIcon} size={iconSizes.lg} color={item.color} testID={testIDs.assignmentIcon} />
                {/* // Assignment name */}
                <TView flex={1}><TText size={16} color={item.color} mx='md' testID={testIDs.assignmentTitle} >{item.name}</TText></TView>
                {/* // Due date */}
                <TText align='right' size={14} color={item.color} testID={testIDs.assignmentDate} >
                    {new Date(item.dueDate.seconds * timeInMS.SECOND).toLocaleDateString(t(`course:dateFormat`), dateFormats)}
                </TText>
            </TTouchableOpacity>
        </TView>
    );

    return (
        isSwipeable ?
            <Swipeable
                ref={(ref) => { swipeableRefs.current[index] = ref; }} renderRightActions={renderRightActions} onSwipeableOpen={(direction) => {if (direction === 'right') { console.log(`Swipe detected on assignment: ${item.name}`); saveTodo(item.name, item.dueDate, item.type); Toast.show({ type: 'success', text1: t(`course:toast_added_to_todo_text1`), text2: t(`course:toast_added_to_todo_text2`), }); swipeableRefs.current[index]?.close(); }}}>
                {assignmentView()}
            </Swipeable>
            : assignmentView()
    );
};

export default AssignmentDisplay;

async function saveTodo(name: string, dueDate: Timestamp, description: string) { try { const res = await callFunction(Todolist.Functions.createTodo, {name, description, dueDate: OurTime.toDate(dueDate).toISOString(), status: "yet"}); if (res.status) { router.back(); Toast.show({type: 'success', text1: t(`course:toast_added_to_todo_text1`), text2: t(`course:toast_added_to_todo_text2`) }); } else { Toast.show({ type: 'error', text1: t(`todo:error_toast_title`), text2: t(`todo:couldnot_save_toast`)}); }} catch (error) { Toast.show({type: 'error', text1: t(`todo:error_toast_title`), text2: t(`todo:couldnot_save_toast`)});} }