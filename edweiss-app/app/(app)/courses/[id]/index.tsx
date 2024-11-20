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
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentDisplay from '@/components/courses/AssignmentDisplay';
import MaterialDisplay from '@/components/courses/MaterialDisplay';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { iconSizes } from '@/constants/Sizes';
import { timeInMS } from '@/constants/Time';
import { useDynamicDocs, usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import { Assignment, Course, Material } from '@/model/school/courses';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';


// Tests Tags
export const testIDs = {
	scrollView: 'scroll-view',
	courseDescription: 'course-description',
	upcomingAssignments: 'upcoming-assignments',
	assignemtView: 'assignment-view',
	noAssignmentDue: 'no-assignment-due',
	previousAssignmentTouchable: 'navigate-to-archive-button',
	previousAssignmentsIcon: 'previous-assignments-icon',
	previousAssignmentsText: 'previous-assignments-text',
	materialsTitle: 'materials-title',
	toggleFutureMaterialsTouchable: 'future-materials-display-touchable',
	toggleFutureMaterialsIcon: 'toggle-future-materials-icon',
	toggleFutureMaterialsText: 'toggle-future-materials-text',
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

	const currentMaterials = useMemo(() => {
		return materialCollection.filter((material) => {
			const currentTime = new Date().getTime();
			const fromTime = material.data.from.seconds * timeInMS.SECOND;
			const toTime = material.data.to.seconds * timeInMS.SECOND;
			return fromTime <= currentTime && currentTime <= toTime;
		});
	}, [materialCollection, timeInMS.SECOND]);

	const passedMaterials = useMemo(() => {
		return materialCollection.filter((material) => {
			const currentTime = new Date().getTime();
			const toTime = material.data.to.seconds * timeInMS.SECOND;
			return currentTime > toTime;
		});
	}, [materialCollection, timeInMS.SECOND]);

	const futureMaterials = useMemo(() => {
		return materialCollection.filter((material) => {
			const currentTime = new Date().getTime();
			const fromTime = material.data.from.seconds * timeInMS.SECOND;
			return currentTime < fromTime;
		});
	}, [materialCollection, timeInMS.SECOND]);

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
		return filteredAssignments;
	}, [assignments, timeInMS.SECOND]);

	const [showFutureMaterials, setShowFutureMaterials] = useState(false);

	const toggleFutureMaterials = () => {
		setShowFutureMaterials(!showFutureMaterials);
	};

	//Checks
	if (!isValidId) { return <Redirect href={'/'} />; }
	if (course == undefined || assignmentsCollection == undefined || materialCollection == undefined) { return <TActivityIndicator size={40} />; }

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader title={course.data.name} align="center" isBold />

			{/* ScrollView pour permettre le défilement */}
			<TScrollView testID={testIDs.scrollView} p={16} backgroundColor="mantle" >

				<TText testID={testIDs.courseDescription} size={16} color='text' mb={10} >{course.data.description}</TText>

				{/* Section des Pending Assignments */}
				<TText mb={10} size={18} color='darkBlue' bold testID={testIDs.upcomingAssignments} >{t(`course:upcoming_assignment_title`)}</TText>

				<For
					each={upcomingAssignments.length > 0 ? upcomingAssignments : undefined}
					fallback={<TText size={16} testID={testIDs.noAssignmentDue}>{t('course:no_assignment_due')}</TText>}
				>{(assignment, index) => (
					<AssignmentDisplay item={assignment} index={index} isSwipeable key={assignment.name} />
				)}
				</For>

				{/* Bouton vers les Passed Assignments */}
				<TTouchableOpacity testID={testIDs.previousAssignmentTouchable} alignItems='center' onPress={() => router.push({ pathname: `/courses/[id]/archive`, params: { id: course.id, rawAssignments: JSON.stringify(previousAssignments) } })}>
					<TView flexDirection='row' mt={8} mb={16} >
						<Icon
							testID={testIDs.previousAssignmentsIcon}
							name={'chevron-forward-circle'}
							size={iconSizes.md}
							color='cherry'
							mr={8}
						/>
						<TText color='cherry' testID={testIDs.previousAssignmentsText} >{t(`course:previous_assignment_title`)}</TText>
					</TView>
				</TTouchableOpacity>

				<TText testID={testIDs.materialsTitle} mb={10} size={18} color='darkBlue' bold >{t(`course:materials_title`)}</TText>

				{/* Bouton pour afficher/masquer les "futureMaterials" */}
				<TTouchableOpacity testID={testIDs.toggleFutureMaterialsTouchable} alignItems='flex-start' onPress={toggleFutureMaterials}>
					<TView flexDirection='row' mt={8} mb={8} >
						<Icon
							testID={testIDs.toggleFutureMaterialsIcon}
							name={showFutureMaterials ? 'chevron-down' : 'chevron-forward'}
							size={iconSizes.sm}
							color='blue'
							mr={8}
						/>
						<TText testID={testIDs.toggleFutureMaterialsTouchable} color='blue' align="center">
							{showFutureMaterials ? t('course:hide_future_materials') : t('course:show_future_materials')}
						</TText>
					</TView>

				</TTouchableOpacity>

				{showFutureMaterials && (futureMaterials.map((material, index) => (
					<React.Fragment key={index}>
						<MaterialDisplay item={material.data} />
						<TView bb={1} mx={20} mb={12} borderColor='overlay0' />
					</React.Fragment>
				)))}

				{currentMaterials.map((material, index) => (<MaterialDisplay item={material.data} key={index} />))}

				{/*<TView bb={1} my={10} borderColor='crust' />}*/}

				{passedMaterials.map((material, index) => (<MaterialDisplay item={material.data} key={index} />))}

				<TView mb={30} />

			</TScrollView>
		</>
	);
};

export default CoursePage;