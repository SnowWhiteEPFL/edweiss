import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import React from 'react';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';


// Tests Tags
export const testIDs = {
    screenTouchable: 'screen-touchable',
    screenView: 'screen-view',
    addAssignmentBouton: 'add-assignment-bouton',
    addAssignmentText: 'add-assignment-text',
    addMaterialBouton: 'add-material-bouton',
    addMaterialText: 'add-material-text',
};

interface SelectActionsAnimatedProps {
    onOutsideClick: () => void;
    onSelectAssignment: () => void;
    onSelectMaterial: () => void;
}


/**
 * AddMaterial Component
 * 
 * This component is responsible for displaying actions options to be selected when the teacher 
 * wants to add assignments or materials to the course.
 * 
 * 
 * @returns JSX.Element - The rendered component for the actions selection animation.
 */
const SelectActions: ReactComponent<SelectActionsAnimatedProps> = ({ onOutsideClick, onSelectAssignment, onSelectMaterial }) => {

    return (
        <TTouchableOpacity
            testID={testIDs.screenTouchable}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onOutsideClick}
            activeOpacity={1}
        >
            <TView testID={testIDs.screenView} justifyContent='center' alignItems='center' p={20} pt={550}>
                <TTouchableOpacity
                    testID={testIDs.addAssignmentBouton}
                    backgroundColor='mantle'
                    py={20}
                    px={30}
                    mb={15}
                    borderColor='text'
                    justifyContent='center'
                    alignItems='center'
                    style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 4,
                        width: '80%',
                        maxWidth: 350,
                        alignItems: 'center',
                    }}
                    onPress={onSelectAssignment}
                >
                    <TText testID={testIDs.addAssignmentText} size={18} bold color='blue'>{t(`course:add_assignment`)}</TText>
                </TTouchableOpacity>

                <TTouchableOpacity
                    testID={testIDs.addMaterialBouton}
                    backgroundColor='mantle'
                    py={20}
                    px={30}
                    mb={15}
                    borderColor='text'
                    justifyContent='center'
                    alignItems='center'
                    style={{
                        borderWidth: 1,
                        borderRadius: 10,
                        shadowColor: '#000',
                        shadowOpacity: 0.2,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 4,
                        width: '80%',
                        maxWidth: 350,
                        alignItems: 'center',
                    }}
                    onPress={onSelectMaterial}
                >
                    <TText testID={testIDs.addMaterialText} size={18} bold color='blue'>{t(`course:add_material`)}</TText>
                </TTouchableOpacity>
            </TView>
        </TTouchableOpacity>
    );
};

export default SelectActions;