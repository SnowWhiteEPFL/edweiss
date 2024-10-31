/**
 * CoursePage component displays the details of a specific course including its assignments.
 * 
 * @returns {JSX.Element} The rendered component.
 * 
 * The component performs the following tasks:
 * - Retrieves the course ID from the URL parameters.
 * - Fetches the course data from Firestore using the course ID.
 * - Displays a loading indicator while the course data is being fetched.
 * - Sorts the assignments by their due date and assigns a color based on the time remaining until the due date.
 * - Renders a list of assignments that are not yet due.
 * - Provides navigation buttons for additional course resources like slides, exercises, and feedbacks.
 * 
 * The component uses various custom components like TActivityIndicator, TText, TTouchableOpacity, and TView for rendering UI elements.
 * 
 * @component
 */
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentDisplay, { testIDs as assignmentTestIDs, AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { LightDarkProps } from '@/constants/Colors';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useThemeColor from '@/hooks/theme/useThemeColor';
import { Course } from '@/model/school/courses';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useRef } from 'react';
import { StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';


// Constants

// Time constants
const msInASecond = 1000;
const msInAMinute = 60 * msInASecond;
const msInAnHour = 60 * msInAMinute;
const msInADay = 24 * msInAnHour;

// Sizes
const TActivityIndicatorSize = 40;
const iconSizes = {
	xs: 18,
	sm: 22,
	md: 26,
	lg: 30,
	xl: 34
};

// Icons
const slidesIcon = 'albums-outline';
const exerciseIcon = 'document-text-outline';
const feedbackIcon = 'arrow-undo-outline';

// Tests Tags
const testIDs = {
	...assignmentTestIDs,
	scrollView: 'scroll-view',
	upcomingAssignments: 'upcoming-assignments',
	assignemtView: 'assignment-view',
	noAssignmentDue: 'no-assignment-due',
	previousAssignments: 'previous-assignments',
	thisWeekTitle: 'this-week-title',
	thisWeekText: 'this-week-text',
	slidesIcon: 'slides-icon',
	slidesText: 'slides-text',
	exercisesIcon: 'exercises-icon',
	exercisesText: 'exercises-text',
	feedbacksIcon: 'feedbacks-icon',
	feedbacksText: 'feedbacks-text',
};


/**
 * CoursePage Component
 * 
 * This component is responsible for displaying the details of a specific course.
 * It fetches the course data from Firestore using the course ID obtained from the URL.
 * If the course data is not available, it shows a loading indicator.
 * If the course ID is invalid, it redirects to the home page.
 * 
 * @returns JSX.Element - The rendered component for the course page.
 */
const CoursePage: React.FC<LightDarkProps> = ({ light, dark }) => {

	// Colors
	const backgroundColor = useThemeColor({ light, dark }, 'mantle');
	const cherryColor = useThemeColor({ light, dark }, 'cherry');
	const defaultColor = useThemeColor({ light, dark }, 'darkNight');
	const urgentColor = useThemeColor({ light, dark }, 'yellow');
	const headingsColor = useThemeColor({ light, dark }, 'darkBlue');
	const swipeBackgroundColor1 = useThemeColor({ light, dark }, 'yellowlogo');
	const swipeBackgroundColor2 = useThemeColor({ light, dark }, 'clearGreen');

	// Define swipeableRefs
	const swipeableRefs = useRef<(Swipeable | null)[]>([]);

	// Get course id from URL
	const { id } = useLocalSearchParams();
	if (typeof id !== 'string') return <Redirect href={'/'} />;

	// Get course data from Firestore
	const [course] = usePrefetchedDynamicDoc(CollectionOf<Course>('courses'), id, undefined);
	if (course == undefined) return <TActivityIndicator size={TActivityIndicatorSize} />;

	// console.log(`nb assignments: ${course.data.assignments.length}`);
	// console.log(JSON.stringify(course));

	// Sort assignments by due date and add color based on time difference
	const assignments: AssignmentWithColor[] = course.data.assignments
		.sort((a, b) => a.dueDate.seconds - b.dueDate.seconds) // Seconds comparison
		.map((assignment) => {
			const currentTime = new Date().getTime(); // Actual time in millisecondes
			const assignmentDueTime = assignment.dueDate.seconds * msInASecond; // Convert dueDate in millisecondes
			const timeDifference = assignmentDueTime - currentTime; // Difference between current time and due time

			// Define color based on time difference
			const color =
				timeDifference <= msInADay // Less than 24 hours
					? urgentColor // Color for less than 24 hours
					: defaultColor; // Default color

			return {
				...assignment,
				color, // add color to assignment
			};
		});

	// Filter upcoming assignments
	const upcomingAssignments = assignments.filter(
		(assignment) => assignment.dueDate.seconds * msInASecond > new Date().getTime()
	);

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader title={course.data.name} align="center" isBold={true} />

			{/* ScrollView pour permettre le défilement */}
			<TScrollView contentContainerStyle={[styles.container, { backgroundColor }]} testID={testIDs.scrollView} >
				{/* Section des Pending Assignments */}
				<TText style={[styles.subHeader, { color: headingsColor }]} testID={testIDs.upcomingAssignments} >{t(`course:upcoming_assignment_title`)}</TText>

				{/* Liste des assignments avec map */}
				{upcomingAssignments.length > 0 ?
					upcomingAssignments.map((assignment) => (
						<TView key={assignment.name} testID={testIDs.assignemtView}>
							<AssignmentDisplay item={assignment} index={upcomingAssignments.indexOf(assignment)} backgroundColor={backgroundColor} swipeBackgroundColor={swipeBackgroundColor2} defaultColor={defaultColor} swipeableRefs={swipeableRefs} />
						</TView>
					))
					:
					<TText style={styles.assignmentText} testID={testIDs.noAssignmentDue} >{t('course:no_assignment_due')}</TText>
				}

				{/* Bouton vers les Passed Assignments */}
				<TTouchableOpacity onPress={() => router.push(`/courses/${course.id}/archive` as any)}>
					<TText style={[styles.previousAssignments, { color: cherryColor }]} testID={testIDs.previousAssignments} >{t(`course:previous_assignment_title`)}</TText>
				</TTouchableOpacity>

				{/* This Week Section */}
				<TText style={[styles.subHeader, { color: headingsColor }]} testID={testIDs.thisWeekTitle} >{t(`course:this_week`)} :</TText>
				<TText style={[styles.thisWeekText, { color: defaultColor }]} testID={testIDs.thisWeekText} >
					Lorem ipsum dolor sit amet consectetur. Ipsum aliquam ut in dignissim nisl. Donec egestas sed amet dictumst odio magna at. Integer risus pellentesque velit sed sit bibendum. Elementum consectetur cras viverra nunc dictum et lacus varius semper. Purus viverra molestie ornare tortor purus sed. Ut nisl non risus nunc facilisi odio purus. Ullamcorper nibh elementum ultricies pulvinar integer libero. Sagittis pretium nunc quam vitae et diam condimentum diam nunc. Quis amet tellus pellentesque amet hac.
				</TText>

				{/* Documents */}
				<TTouchableOpacity style={styles.docButton} onPress={() => console.log('Go to Slides')}>
					<Icon name={slidesIcon} size={iconSizes.md} testID={testIDs.slidesIcon} />
					{/* Other possible icons : document-outline, document-text-outline */}
					<TText style={styles.docButtonText} testID={testIDs.slidesText} >Slides</TText>
				</TTouchableOpacity>

				<TTouchableOpacity style={styles.docButton} onPress={() => console.log('Go to Exercises')}>
					<Icon name={exerciseIcon} size={iconSizes.md} testID={testIDs.exercisesIcon} />
					<TText style={styles.docButtonText} testID={testIDs.exercisesText} >Exercises</TText>
				</TTouchableOpacity>

				<TTouchableOpacity style={styles.docButton} onPress={() => console.log('Go to Feedbacks')}>
					<Icon name={feedbackIcon} size={iconSizes.md} testID={testIDs.feedbacksIcon} />
					<TText style={styles.docButtonText} testID={testIDs.feedbacksText} >Feedbacks</TText>
				</TTouchableOpacity>
			</TScrollView>
		</>
	);
};

// // Render assignment
// export const RenderAssignment: ReactComponent<{ item: Assignment, index: number, backgroundColor: string, swipeBackgroundColor: string, defaultColor: string, swipeableRefs: React.MutableRefObject<(Swipeable | null)[]>; }> = ({ item, index, backgroundColor, swipeBackgroundColor, defaultColor, swipeableRefs }) => {

// 	const renderRightActions = () => (
// 		<TView style={[styles.rightAction, { backgroundColor: swipeBackgroundColor }]} testID={testIDs.swipeView}>
// 			<TText style={styles.actionText}>{t(`course:add_to_todo`)}</TText>
// 		</TView>
// 	);

// 	return (
// 		<Swipeable
// 			ref={(ref) => {
// 				// Stocker la référence Swipeable dans un tableau par index
// 				swipeableRefs.current[index] = ref;
// 			}}
// 			renderRightActions={renderRightActions}  // Render actions on swipe
// 			onSwipeableOpen={(direction) => {
// 				if (direction === 'right') {
// 					console.log(`Swipe detected on assignment: ${item.name}`);
// 					// Place here the action to be performed when swiping right
// 					Toast.show({
// 						type: 'success',
// 						text1: t(`course:toast_added_to_todo_text1`),
// 						text2: t(`course:toast_added_to_todo_text2`),
// 					});
// 					swipeableRefs.current[index]?.close();
// 				}
// 			}}
// 		// DEPRECATED : onSwipeableRightOpen={onSwipeRightToLeft}  // Detects swipe from right to left
// 		>
// 			<TView style={styles.assignmentRow}>
// 				<TTouchableOpacity style={[styles.assignmentField, { backgroundColor }]}>
// 					{/* // Icon */}
// 					<Icon name={item.type === SUBMISSION_TYPE ? submissionIcon : quizIcon} size={iconSizes.lg} color={item.color == defaultColor ? defaultColorName : urgentColorName} testID={testIDs.assignmentIcon} />
// 					{/* // Assignment name */}
// 					<TText style={[styles.assignmentText, { color: item.color }]} mx='md' testID={testIDs.assignmentTitle} >{item.name}</TText>
// 					{/* // Due date */}
// 					<TText style={[styles.dueDate, { color: item.color }]} testID={testIDs.assignmentDate} >
// 						{new Date(item.dueDate.seconds * msInASecond).toLocaleDateString(t(`course:dateFormat`), dateFormats)}
// 					</TText>
// 				</TTouchableOpacity>
// 			</TView>
// 		</Swipeable>
// 	);
// };

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

export default CoursePage;