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
import AssignmentDisplay, { testIDs as assignmentTestIDs } from '@/components/courses/AssignmentDisplay';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { iconSizes } from '@/constants/Sizes';
import { timeInMS } from '@/constants/Time';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { Assignment, Course } from '@/model/school/courses';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React from 'react';


// Constants

// Icons
const slidesIcon = 'albums-outline';
const exerciseIcon = 'document-text-outline';
const feedbackIcon = 'arrow-undo-outline';

// Tests Tags
export const testIDs = {
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

type AssignmentWithColor = Assignment & { color: Color; };


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
const CoursePage: ApplicationRoute = () => {

	// Get course id from URL
	const { id } = useLocalSearchParams();
	if (typeof id !== 'string') return <Redirect href={'/'} />;

	// Get course data from Firestore
	const [course] = usePrefetchedDynamicDoc(CollectionOf<Course>('courses'), id, undefined);
	if (course == undefined) return <TActivityIndicator size={40} />;

	// Sort assignments by due date and add color based on time difference
	const assignments: AssignmentWithColor[] = course.data.assignments
		.sort((a, b) => a.dueDate.seconds - b.dueDate.seconds) // Seconds comparison
		.map((assignment) => {
			const currentTime = new Date().getTime(); // Actual time in millisecondes
			const assignmentDueTime = assignment.dueDate.seconds * timeInMS.SECOND; // Convert dueDate in millisecondes
			const timeDifference = assignmentDueTime - currentTime; // Difference between current time and due time

			// Define color based on time difference
			const color =
				0 <= timeDifference && timeDifference <= timeInMS.DAY // Less than 24 hours
					? 'yellow' // Color for less than 24 hours
					: 'darkNight'; // Default color

			return {
				...assignment,
				color, // add color to assignment
			};
		});

	// Filter previous assignments
	const previousAssignments = assignments.filter(
		(assignment) => assignment.dueDate.seconds * timeInMS.SECOND <= new Date().getTime()
	).reverse();

	// Filter upcoming assignments
	const upcomingAssignments = assignments.filter(
		(assignment) => assignment.dueDate.seconds * timeInMS.SECOND > new Date().getTime()
	);

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader title={course.data.name} align="center" isBold={true} />

			{/* ScrollView pour permettre le défilement */}
			<TScrollView p={16} backgroundColor="mantle" testID={testIDs.scrollView} >

				{/* Section des Pending Assignments */}
				<TText mb={10} size={18} color='darkBlue' bold={true} testID={testIDs.upcomingAssignments} >{t(`course:upcoming_assignment_title`)}</TText>

				{/* Liste des assignments avec map */}
				{upcomingAssignments.length > 0
					?
					upcomingAssignments.map((assignment) => (
						<TView key={assignment.name} testID={testIDs.assignemtView}>
							<AssignmentDisplay item={assignment} index={upcomingAssignments.indexOf(assignment)} isSwipeable={true} />
						</TView>
					))
					:
					<TText size={16} testID={testIDs.noAssignmentDue} >{t('course:no_assignment_due')}</TText>
				}

				{/* Bouton vers les Passed Assignments */}
				<TTouchableOpacity onPress={() =>
					router.push({
						pathname: `/courses/[id]/archive`, // Forcer la chaîne à être interprétée comme littérale
						params: { id: course.id, extraInfo: JSON.stringify(previousAssignments) }
					})
				}>
					<TText my={20} align='center' color='cherry' testID={testIDs.previousAssignments} >{t(`course:previous_assignment_title`)}</TText>
				</TTouchableOpacity>

				{/* This Week Section */}
				<TText mb={10} size={18} color='darkBlue' bold={true} testID={testIDs.thisWeekTitle} >{t(`course:this_week`)} :</TText>
				<TText align='justify' size={15} color='darkNight' py={16} textBreakStrategy='highQuality' lineHeight={50} testID={testIDs.thisWeekText} >
					Lorem ipsum dolor sit amet consectetur. Ipsum aliquam ut in dignissim nisl. Donec egestas sed amet dictumst odio magna at. Integer risus pellentesque velit sed sit bibendum. Elementum consectetur cras viverra nunc dictum et lacus varius semper. Purus viverra molestie ornare tortor purus sed. Ut nisl non risus nunc facilisi odio purus. Ullamcorper nibh elementum ultricies pulvinar integer libero. Sagittis pretium nunc quam vitae et diam condimentum diam nunc. Quis amet tellus pellentesque amet hac.
					Lorem ipsum dolor sit amet consectetur. Ipsum aliquam ut in dignissim nisl. Donec egestas sed amet dictumst odio magna at. Integer risus pellentesque velit sed sit bibendum. Elementum consectetur cras viverra nunc dictum et lacus varius semper. Purus viverra molestie ornare tortor purus sed. Ut nisl non risus nunc facilisi odio purus. Ullamcorper nibh elementum ultricies pulvinar integer libero. Sagittis pretium nunc quam vitae et diam condimentum diam nunc. Quis amet tellus pellentesque amet hac.
				</TText>

				{/* Documents */}
				<TTouchableOpacity flexDirection='row' alignItems='center' py={10} mb={10} bb={1} borderColor='crust' onPress={() => console.log('Go to Slides')}>
					<Icon name={slidesIcon} size={iconSizes.md} testID={testIDs.slidesIcon} />
					{/* Other possible icons : document-outline, document-text-outline */}
					<TText size={16} ml={10} testID={testIDs.slidesText} >Slides</TText>
				</TTouchableOpacity>
				<TTouchableOpacity flexDirection='row' alignItems='center' py={10} mb={10} bb={1} borderColor='crust' onPress={() => console.log('Go to Exercises')}>
					<Icon name={exerciseIcon} size={iconSizes.md} testID={testIDs.exercisesIcon} />
					<TText size={16} ml={10} testID={testIDs.exercisesText} >Exercises</TText>
				</TTouchableOpacity>
				<TTouchableOpacity flexDirection='row' alignItems='center' py={10} mb={30} bb={1} borderColor='crust' onPress={() => console.log('Go to Feedbacks')}>
					<Icon name={feedbackIcon} size={iconSizes.md} testID={testIDs.feedbacksIcon} />
					<TText size={16} ml={10} testID={testIDs.feedbacksText} >Feedbacks</TText>
				</TTouchableOpacity>
			</TScrollView>
		</>
	);
};

export default CoursePage;