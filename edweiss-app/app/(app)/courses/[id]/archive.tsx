import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentDisplay, { testIDs as assignmentTestIDs } from '@/components/courses/AssignmentDisplay';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import { iconSizes } from '@/constants/Sizes';
import { Assignment } from '@/model/school/courses';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';


// Tests Tags
export const testIDs = {
	...assignmentTestIDs,
	assignemtView: 'assignment-view',
};

type AssignmentWithColor = Assignment & { color: Color; };

// interface PreviousAssignmentsProps extends LightDarkProps {
//     extraInfo?: string; // Ce sera une chaîne JSON que tu vas parser
// }

/**
 * PreviousAssignmentsPage Component
 * 
 * This component is responsible for displaying the previous assignments of a course.
 * It fetches the assignments data from the URL and displays them in a scrollable list.
 * 
 * @param extraInfo - The extra information passed in the URL.
 * 
 * @returns JSX.Element - The rendered component for the previous assignments page.
 */
const PreviousAssignmentsPage: ApplicationRoute = () => { //const PreviousAssignmentsPage: React.FC<PreviousAssignmentsProps> = ({ light, dark, extraInfo }) => {

	const { extraInfo } = useLocalSearchParams();

	let assignments: AssignmentWithColor[] = [];


	// Extract assignments from extraInfo
	if (typeof extraInfo === 'string') {
		try { assignments = JSON.parse(extraInfo); assignments = assignments.map((assignment) => ({ ...assignment, dueDate: { seconds: assignment.dueDate.seconds, nanoseconds: assignment.dueDate.nanoseconds, }, })); }
		catch (error) { console.error('Failed to parse extraInfo:', error); }
	} else {
		console.log('No assignment given in archive assignments');
	}

	return (
		<>
			{/* Utilisation du RouteHeader pour afficher le titre du cours */}
			<RouteHeader title={t(`course:previous_assignment_title`)} align="center" isBold={false} />

			{/* ScrollView pour permettre le défilement */}
			<TScrollView backgroundColor='mantle' flex={1} p={16}>

				<TTouchableOpacity flexDirection='row' alignItems='center' py={12} bb={1} borderColor='crust' disabled>
					{/* // Icon */}
					<Icon name='archive' size={iconSizes.xl} color='darkBlue' />
					{/* // Assignment name */}
					<TText size={18} bold={true} color='darkBlue' ml='sm'>{t(`course:archived_assignments`)}</TText>
				</TTouchableOpacity>

				{/* Liste des assignments avec map */}

				{assignments.length > 0 ?
					assignments.map((assignment) => (
						<TView key={assignment.name} testID={testIDs.assignemtView}>
							<AssignmentDisplay item={assignment} index={assignments.indexOf(assignment)} isSwipeable={false} />
						</TView>
					))
					: <TView flex={1}><TText size={16}>{t('course:no_past_assignment')}</TText></TView>
				}
			</TScrollView>
		</>
	);
};

export default PreviousAssignmentsPage;