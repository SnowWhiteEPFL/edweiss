/**
 * @file archive.tsx
 * @description Module for displaying the archive screen
 * @author Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import AssignmentDisplay, { AssignmentWithColor } from '@/components/courses/AssignmentDisplay';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { ApplicationRouteSignature, useRouteParameters } from '@/hooks/routeParameters';
import React from 'react';


// Tests Tags
export const testIDs = {
    archiveScrollView: 'archive-scroll-view',
    archiveTouchable: 'archive-touchable',
    archiveIcon: 'archive-icon',
    archiveTitle: 'archive-title',
    noArchive: 'no-archive',
};

export const ArchiveRouteSignature: ApplicationRouteSignature<{
    courseId: string,
    assignments: { id: string, data: AssignmentWithColor }[]
}> = {
    path: `/courses/[id]/archive`
}

/**
 * ArchiveScreen Component
 * 
 * This component is responsible for displaying the previous assignments of a course.
 * It fetches the assignments data from the URL and displays them in a scrollable list.
 * 
 * 
 * @returns JSX.Element - The rendered component for the previous assignments page.
 */
const ArchiveScreen: ApplicationRoute = () => {

    const { courseId, assignments } = useRouteParameters(ArchiveRouteSignature);

    return (
        <>
            <RouteHeader title={t(`course:previous_assignment_title`)} align="center" />

            <TScrollView testID={testIDs.archiveScrollView} backgroundColor='mantle' flex={1} p={16}>

                {assignments.length > 0 ?
                    assignments.map((assignment, index) => (
                        <AssignmentDisplay item={assignment.data} id={assignment.id} courseID={courseId} index={index} key={assignment.data.name} />
                    ))
                    : <TView flex={1} testID={testIDs.noArchive}><TText size={16}>{t('course:no_past_assignment')}</TText></TView>
                }
            </TScrollView>
        </>
    );

}; export default ArchiveScreen;