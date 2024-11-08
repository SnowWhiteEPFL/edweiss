/**
 * @file archive.tsx
 * @description Module for displaying the archive screen
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import RouteHeader from '@/components/core/header/RouteHeader';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { useLocalSearchParams } from 'expo-router';
import ArchiveScreen from '../../../../components/courses/ArchiveScreen';
import { parseAssignments } from '../../../../utils/courses/utilsParseAssignments';

// ------------------------------------------------------------
// -----------------   Todo Creation Screen   -----------------
// ------------------------------------------------------------

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
const PreviousAssignmentsPage: ApplicationRoute = () => { const { extraInfo } = useLocalSearchParams(); return (<><RouteHeader title={t(`course:previous_assignment_title`)} align="center" isBold={false} /><ArchiveScreen assignments={parseAssignments(typeof extraInfo === 'string' ? extraInfo : undefined)} /></>); }; export default PreviousAssignmentsPage;