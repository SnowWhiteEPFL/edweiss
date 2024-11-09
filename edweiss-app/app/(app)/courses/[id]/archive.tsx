/**
 * @file archive.tsx
 * @description Module for displaying the archive screen
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentDisplay, { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { iconSizes } from '@/constants/Sizes';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';


// Tests Tags
export const testIDs = {
    archiveScrollView: 'archive-scroll-view',
    archiveTouchable: 'archive-touchable',
    archiveIcon: 'archive-icon',
    archiveTitle: 'archive-title',
    noArchive: 'no-archive',
};

// ------------------------------------------------------------
// -------------------  The Archive screen   ------------------
// ------------------------------------------------------------

/**
 * ArchiveScreen Component
 * 
 * This component is responsible for displaying the previous assignments of a course.
 * It fetches the assignments data from the URL and displays them in a scrollable list.
 * 
 * @param extraInfo - The extra information passed in the URL.
 * 
 * @returns JSX.Element - The rendered component for the previous assignments page.
 */
const ArchiveScreen: ApplicationRoute = () => {
    const { extraInfo } = useLocalSearchParams();

    let assignments: AssignmentWithColor[] = [];

    if (typeof extraInfo === 'string') {
        try {
            assignments = JSON.parse(extraInfo);
            assignments.map((assignment: AssignmentWithColor) => ({
                ...assignment,
                dueDate: {
                    seconds: assignment.dueDate.seconds,
                    nanoseconds: assignment.dueDate.nanoseconds,
                },
            }));
        } catch (error) {
            console.error('Failed to parse extraInfo: ', error);
            assignments = [];
        }
    } else {
        console.error('Invalid extraInfo (not a string): ', extraInfo);
        assignments = [];
    }

    return (
        <>
            <RouteHeader title={t(`course:previous_assignment_title`)} align="center" isBold={false} />

            <TScrollView testID={testIDs.archiveScrollView} backgroundColor='mantle' flex={1} p={16}>

                <TTouchableOpacity testID={testIDs.archiveTouchable} flexDirection='row' alignItems='center' py={12} bb={1} borderColor='crust' disabled>
                    {/* // Icon */}
                    <Icon testID={testIDs.archiveIcon} name='archive' size={iconSizes.xl} color='darkBlue' />
                    {/* // Assignment name */}
                    <TText testID={testIDs.archiveTitle} size={18} bold={true} color='darkBlue' ml='sm'>{t(`course:archived_assignments`)}</TText>
                </TTouchableOpacity>

                {/* Liste des assignments avec map */}

                {assignments.length > 0 ?
                    assignments.map((assignment) => (
                        <AssignmentDisplay item={assignment} index={assignments.indexOf(assignment)} isSwipeable={false} />
                    ))
                    : <TView flex={1} testID={testIDs.noArchive}><TText size={16}>{t('course:no_past_assignment')}</TText></TView>
                }
            </TScrollView>
        </>
    );

}; export default ArchiveScreen;