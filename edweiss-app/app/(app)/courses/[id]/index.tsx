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
 */
import For from '@/components/core/For';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentDisplay, { testIDs as assignmentTestIDs } from '@/components/courses/AssignmentDisplay';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { timeInMS } from '@/constants/Time';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { Assignment, Course, Material } from '@/model/school/courses';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';


// Tests Tags
export const testIDs = {
	...assignmentTestIDs,
	scrollView: 'scroll-view',
	upcomingAssignments: 'upcoming-assignments',
	assignemtView: 'assignment-view',
	noAssignmentDue: 'no-assignment-due',
	previousAssignmentTouchable: 'navigate-to-archive-button',
	previousAssignments: 'previous-assignments',
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
	// if (typeof id !== 'string') return <Redirect href={'/'} />;

	// Redirection si l'ID n'est pas valide
	const isValidId = typeof id === 'string';

	// Récupérer les données du cours et des assignments depuis Firestore
	const result = usePrefetchedDynamicDoc(
		CollectionOf<Course>('courses'),
		isValidId ? id : '',
		undefined
	);

	const [course] = Array.isArray(result) ? result : [undefined];

	const assignmentsCollection = useDynamicDocs(
		CollectionOf<Assignment>(`courses/${isValidId ? id : ''}/assignments`)
	) || [];

	const materialCollection = useDynamicDocs(
		CollectionOf<Material>(`courses/${isValidId ? id : ''}/materials`)
	) || [];

	// Sort assignments by due date and add color based on time difference
	const assignments: AssignmentWithColor[] = assignmentsCollection
		.sort((a, b) => a.data.dueDate.seconds - b.data.dueDate.seconds) // Seconds comparison
		.map((assignment) => {
			const currentTime = new Date().getTime(); // Actual time in millisecondes
			const assignmentDueTime = assignment.data.dueDate.seconds * timeInMS.SECOND; // Convert dueDate in millisecondes
			const timeDifference = assignmentDueTime - currentTime; // Difference between current time and due time

			// Define color based on time difference
			const color =
				0 <= timeDifference && timeDifference <= timeInMS.DAY // Less than 24 hours
					? 'yellow' // Color for less than 24 hours
					: 'darkNight'; // Default color

			return {
				...assignment.data,
				color, // add color to assignment
			};
		});

	// Filter previous assignments
	const previousAssignments = useMemo(() => {
		return assignments
			.filter(
				(assignment) =>
					assignment.dueDate.seconds * timeInMS.SECOND <= new Date().getTime()
			)
			.reverse();
	}, [assignments, timeInMS.SECOND]);

	// Filter upcoming assignments
	const upcomingAssignments = useMemo(() => {
		const filteredAssignments = assignments.filter(
			(assignment) =>
				assignment.dueDate.seconds * timeInMS.SECOND > new Date().getTime()
		);
		return filteredAssignments.length > 0 ? filteredAssignments : undefined;
	}, [assignments, timeInMS.SECOND]);

	//Checks
	if (!isValidId) { return <Redirect href={'/'} />; }
	if (course == undefined || assignmentsCollection == undefined || materialCollection == undefined) { return <TActivityIndicator size={40} />; }

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader title={course.data.name} align="center" isBold />

			{/* ScrollView pour permettre le défilement */}
			<TScrollView testID={testIDs.scrollView} p={16} backgroundColor="mantle" >

				{/* Section des Pending Assignments */}
				<TText mb={10} size={18} color='darkBlue' bold testID={testIDs.upcomingAssignments} >{t(`course:upcoming_assignment_title`)}</TText>

				<For
					each={upcomingAssignments}
					fallback={<TText size={16} testID={testIDs.noAssignmentDue}>{t('course:no_assignment_due')}</TText>}
				>{(assignment, index) => (
					<AssignmentDisplay item={assignment} index={index} isSwipeable key={assignment.name} />
				)}
				</For>

				{/* Bouton vers les Passed Assignments */}
				<TTouchableOpacity testID={testIDs.previousAssignmentTouchable} onPress={() => router.push({ pathname: `/courses/[id]/archive`, params: { id: course.id, extraInfo: JSON.stringify(previousAssignments) } })}>
					<TText my={20} align='center' color='cherry' testID={testIDs.previousAssignments} >{t(`course:previous_assignment_title`)}</TText>
				</TTouchableOpacity>

				{materialCollection.map((material, index) => (
					<MaterialDisplay item={material.data} key={index} />
				))}


				{/* <TText mb={10} size={18} color='darkBlue' bold testID={testIDs.thisWeekTitle} >{t(`course:this_week`)}</TText>
				<TText align='justify' size={15} color='darkNight' py={16} textBreakStrategy='highQuality' lineHeight={50} testID={testIDs.thisWeekText} >
					Lorem ipsum dolor sit amet consectetur. Ipsum aliquam ut in dignissim nisl. Donec egestas sed amet dictumst odio magna at. Integer risus pellentesque velit sed sit bibendum. Elementum consectetur cras viverra nunc dictum et lacus varius semper. Purus viverra molestie ornare tortor purus sed. Ut nisl non risus nunc facilisi odio purus. Ullamcorper nibh elementum ultricies pulvinar integer libero. Sagittis pretium nunc quam vitae et diam condimentum diam nunc. Quis amet tellus pellentesque amet hac.
					Lorem ipsum dolor sit amet consectetur. Ipsum aliquam ut in dignissim nisl. Donec egestas sed amet dictumst odio magna at. Integer risus pellentesque velit sed sit bibendum. Elementum consectetur cras viverra nunc dictum et lacus varius semper. Purus viverra molestie ornare tortor purus sed. Ut nisl non risus nunc facilisi odio purus. Ullamcorper nibh elementum ultricies pulvinar integer libero. Sagittis pretium nunc quam vitae et diam condimentum diam nunc. Quis amet tellus pellentesque amet hac.
				</TText>

				<TTouchableOpacity testID={testIDs.slidesTouchable} flexDirection='row' alignItems='center' py={10} mb={10} bb={1} borderColor='crust' onPress={() => console.log('Go to Slides')}>
					<Icon name={slidesIcon} size={iconSizes.md} testID={testIDs.slidesIcon} />
					<TText size={16} ml={10} testID={testIDs.slidesText} >Slides</TText>
				</TTouchableOpacity>
				<TTouchableOpacity testID={testIDs.exercisesTouchable} flexDirection='row' alignItems='center' py={10} mb={10} bb={1} borderColor='crust' onPress={() => console.log('Go to Exercises')}>
					<Icon name={exerciseIcon} size={iconSizes.md} testID={testIDs.exercisesIcon} />
					<TText size={16} ml={10} testID={testIDs.exercisesText} >Exercises</TText>
				</TTouchableOpacity>
				<TTouchableOpacity testID={testIDs.feedbacksTouchable} flexDirection='row' alignItems='center' py={10} mb={30} bb={1} borderColor='crust' onPress={() => console.log('Go to Feedbacks')}>
					<Icon name={feedbackIcon} size={iconSizes.md} testID={testIDs.feedbacksIcon} />
					<TText size={16} ml={10} testID={testIDs.feedbacksText} >Feedbacks</TText>
				</TTouchableOpacity> */}
			</TScrollView>
		</>
	);
};

export default CoursePage;