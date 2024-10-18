import ReactComponent from '@/constants/Component';
import { StyleSheet } from 'react-native';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { AssignmentBase, SUBMISSION_TYPE } from '@/model/school/courses';
import { Swipeable } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';



// Time constants
const msInASecond = 1000;
const msInAMinute = 60 * msInASecond;
const msInAnHour = 60 * msInAMinute;
const msInADay = 24 * msInAnHour;

// Sizes
const iconSizes = {
    xs: 18,
    sm: 22,
    md: 26,
    lg: 30,
    xl: 34
};

// Icons
const submissionIcon = 'clipboard-outline';
const quizIcon = 'help-circle-outline';

// Colors
const urgentColorName = 'yellow';
const defaultColorName = 'darkNight';

// Date formats
const dateFormats = {
    weekday: 'long' as 'long',  // Displays the day of the week, like "Friday"
    month: 'long' as 'long',    // Displays the month, like "October"
    day: 'numeric' as 'numeric',    // Displays the day of the month, like "12"
};

// Tests Tags
export const testIDs = {
    swipeView: 'swipe-view',
    assignmentIcon: 'assignment-icon',
    assignmentTitle: 'assignment-title',
    assignmentDate: 'assignment-date'
};

// Quizz route
const pathToQuizRoute = "/quiz/temporaryQuizStudentView";

// Hardcoded paths
const hardcodedPathToQuizzes = "courses/placeholderCourseId/quizzes";

// Hardcoded IDs
const hardcodedQuizId = "TestQuizId";
const hardcodedCourseId = "placeholderCourseId";


export type AssignmentWithColor = AssignmentBase & { color: string; };


const AssignmentDisplay: ReactComponent<{ item: AssignmentWithColor, index: number, backgroundColor: string, swipeBackgroundColor: string, defaultColor: string, swipeableRefs: React.MutableRefObject<(Swipeable | null)[]>; }> = ({ item, index, backgroundColor, swipeBackgroundColor, defaultColor, swipeableRefs }) => {

    const renderRightActions = () => (
        <TView style={[styles.rightAction, { backgroundColor: swipeBackgroundColor }]} testID={testIDs.swipeView}>
            <TText style={styles.actionText}>{t(`course:add_to_todo`)}</TText>
        </TView>
    );

    return (
        <Swipeable
            ref={(ref) => { swipeableRefs.current[index] = ref; }}
            renderRightActions={renderRightActions}  // Render actions on swipe
            onSwipeableOpen={(direction) => { if (direction === 'right') { console.log(`Swipe detected on assignment: ${item.name}`); Toast.show({ type: 'success', text1: t(`course:toast_added_to_todo_text1`), text2: t(`course:toast_added_to_todo_text2`), }); swipeableRefs.current[index]?.close(); } }} >
            <TView style={styles.assignmentRow}>
                <TTouchableOpacity style={[styles.assignmentField, { backgroundColor }]}
                // onPress={item.type === QUIZ_TYPE ? () => {
                //     router.push({
                //         pathname: pathToQuizRoute as string,
                //         params: { quizId: hardcodedQuizId, path: hardcodedPathToQuizzes, courseId: hardcodedCourseId }
                //     });
                // } : undefined}
                >
                    {/* // Icon */}
                    <Icon name={item.type as string === SUBMISSION_TYPE ? submissionIcon : quizIcon} size={iconSizes.lg} color={item.color == defaultColor ? defaultColorName : urgentColorName} testID={testIDs.assignmentIcon} />
                    {/* // Assignment name */}
                    <TText style={[styles.assignmentText, { color: item.color }]} mx='md' testID={testIDs.assignmentTitle} >{item.name}</TText>
                    {/* // Due date */}
                    <TText style={[styles.dueDate, { color: item.color }]} testID={testIDs.assignmentDate} >
                        {new Date(item.dueDate.seconds * msInASecond).toLocaleDateString(t(`course:dateFormat`), dateFormats)}
                    </TText>
                </TTouchableOpacity>
            </TView>
        </Swipeable>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    // assignmentList: {
    // 	marginBottom: 20,
    // },
    assignmentField: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc', //EFE6E6
    },
    assignmentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    assignmentText: {
        fontSize: 16,
        flex: 1,
    },
    dueDate: {
        fontSize: 14,
    },
    previousAssignments: {
        textAlign: 'center',
        marginVertical: 20,
    },
    rightAction: {
        justifyContent: 'center',   // Centrer verticalement
        alignItems: 'flex-end',     // Aligner à droite
        paddingHorizontal: 20,      // Espace intérieur à gauche et à droite
        height: '100%',             // Prendre toute la hauteur de la ligne
    },
    actionText: {
        color: '#FFFFFF',           // Texte blanc
        fontWeight: 'bold',         // En gras
        fontSize: 16,               // Taille de la police
    },
    thisWeekText: {
        fontSize: 14,
        marginBottom: 20,
    },
    docButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        marginBottom: 10,
    },
    docButtonText: {
        marginLeft: 10,
        fontSize: 16,
    },
});

export default AssignmentDisplay;
