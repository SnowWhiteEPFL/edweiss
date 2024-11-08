/**
 * @file ArchiveScreen.tsx
 * @description Component for displaying the archive screen
 * @author Floran Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import AssignmentDisplay, { testIDs as assignmentTestIDs } from '@/components/courses/AssignmentDisplay';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { iconSizes } from '@/constants/Sizes';
import { Assignment } from '@/model/school/courses';
import React from 'react';


// Tests Tags
export const testIDs = {
    ...assignmentTestIDs,
    assignemtView: 'assignment-view',
    archiveScrollView: 'archive-scroll-view',
    archiveIcon: 'archive-icon',
    archiveTitle: 'archive-title',
    noArchive: 'no-archive',
};

type AssignmentWithColor = Assignment & { color: Color; };

// ------------------------------------------------------------
// -------------------  The Archive screen   ------------------
// ------------------------------------------------------------

const ArchiveScreen: ReactComponent<{ assignments: AssignmentWithColor[]; }> = ({ assignments }) => {

    return (
        <TScrollView backgroundColor='mantle' flex={1} p={16} testID={testIDs.archiveScrollView}>

            <TTouchableOpacity flexDirection='row' alignItems='center' py={12} bb={1} borderColor='crust' disabled>
                {/* // Icon */}
                <Icon name='archive' size={iconSizes.xl} color='darkBlue' testID={testIDs.archiveIcon} />
                {/* // Assignment name */}
                <TText size={18} bold={true} color='darkBlue' testID={testIDs.archiveTitle} ml='sm'>{t(`course:archived_assignments`)}</TText>
            </TTouchableOpacity>

            {/* Liste des assignments avec map */}

            {assignments.length > 0 ?
                assignments.map((assignment) => (
                    <TView key={assignment.name} testID={testIDs.assignemtView}>
                        <AssignmentDisplay item={assignment} index={assignments.indexOf(assignment)} isSwipeable={false} />
                    </TView>
                ))
                : <TView flex={1} testID={testIDs.noArchive}><TText size={16}>{t('course:no_past_assignment')}</TText></TView>
            }
        </TScrollView>
    );
}

export default ArchiveScreen;
