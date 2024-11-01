import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import { CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { LightDarkProps } from '@/constants/Colors';
import { usePrefetchedDynamicDoc } from '@/hooks/firebase/firestore';
import useThemeColor from '@/hooks/theme/useThemeColor';
import { Course, SUBMISSION_TYPE } from '@/model/school/courses';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';


// Constants

const msInASecond = 1000;
const msInAMinute = 60 * msInASecond;
const msInAnHour = 60 * msInAMinute;
const msInADay = 24 * msInAnHour;

const TActivityIndicatorSize = 40;

const iconSizes = {
	xs: 18,
	sm: 22,
	md: 26,
	lg: 30,
	xl: 34
};

const submissionIcon = 'clipboard-outline';
const quizIcon = 'help-circle-outline';
const archiveIcon = 'archive';

const urgentColorName = 'yellow';
const defaultColorName = 'darkNight';
const headingsColorName = 'darkBlue';

const dateFormats = {
	weekday: 'long' as 'long',  // Displays the day of the week, like "Friday"
	month: 'long' as 'long',    // Displays the month, like "October"
	day: 'numeric' as 'numeric',    // Displays the day of the month, like "12"
};


const PreviousAssignmentsPage: React.FC<LightDarkProps> = ({ light, dark }) => {

	// Colors
	const backgroundColor = useThemeColor({ light, dark }, 'mantle');
	const defaultColor = useThemeColor({ light, dark }, 'darkNight');
	const urgentColor = useThemeColor({ light, dark }, 'yellow');
	const headingsColor = useThemeColor({ light, dark }, 'darkBlue');
	const swipeBackgroundColor = useThemeColor({ light, dark }, 'yellowlogo');

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
				0 <= timeDifference && timeDifference <= msInADay // Less than 24 hours
					? urgentColor // Color for less than 24 hours
					: defaultColor; // Default color

			return {
				...assignment,
				color, // add color to assignment
			};
		});


	// Render assignment
	const renderAssignment = ({ item }: { item: AssignmentWithColor; }) => (
		<TView style={styles.assignmentRow}>
			<TTouchableOpacity style={styles.assignmentField}>
				{/* // Icon */}
				<Icon name={item.type as string === SUBMISSION_TYPE ? submissionIcon : quizIcon} size={iconSizes.lg} color={item.color == defaultColor ? defaultColorName : urgentColorName} />
				{/* // Assignment name */}
				<TText style={[styles.assignmentText, { color: item.color }]} mx='md'>{item.name}</TText>
				{/* // Due date */}
				<TText style={[styles.dueDate, { color: item.color }]}>
					{new Date(item.dueDate.seconds * msInASecond).toLocaleDateString(t(`course:dateFormat`), dateFormats)}
				</TText>
			</TTouchableOpacity>
		</TView>
	);

	// Filter upcoming assignments
	const upcomingAssignments = assignments.filter(
		(assignment) => assignment.dueDate.seconds * msInASecond > new Date().getTime()
	);

	// Filter previous assignments
	const previousAssignments = assignments.filter(
		(assignment) => assignment.dueDate.seconds * msInASecond <= new Date().getTime()
	);

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader title={t(`course:previous_assignment_title`)} align="center" isBold={false} />

			{/* ScrollView pour permettre le défilement */}
			<TScrollView contentContainerStyle={[styles.container, { backgroundColor }]}>

				<TTouchableOpacity style={styles.assignmentField} disabled>
					{/* // Icon */}
					<Icon name={archiveIcon} size={iconSizes.xl} color={headingsColorName} />
					{/* // Assignment name */}
					<TText style={[styles.subHeader, { color: headingsColor }]} ml='sm'>{t(`course:archived_assignments`)}</TText>
				</TTouchableOpacity>

				{/* Liste des assignments avec map */}

				{previousAssignments.length > 0 ?
					previousAssignments.map((assignment) => (
						<TView key={assignment.name}>
							{renderAssignment({ item: assignment })}
						</TView>
					))
					:
					<TText style={styles.assignmentText}>{t('course:no_past_assignment')}</TText>
				}

			</TScrollView>
		</>
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
	}
});

export default PreviousAssignmentsPage;