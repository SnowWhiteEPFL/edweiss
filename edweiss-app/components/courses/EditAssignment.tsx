import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { IconType } from '@/constants/Style';
import { Assignment, AssignmentID, AssignmentType, MAX_ASSIGNMENT_NAME_LENGTH } from '@/model/school/courses';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import FancyButton from '../input/FancyButton';
import FancyTextInput from '../input/FancyTextInput';


// Icons
export const icons: { [key: string]: IconType } = {
};

// Tests Tags
export const testIDs: { [key: string]: string } = {
};


interface EditAssignmentProps {
    assignment: { id: string, data: Assignment };
    onSubmit: (assignmentID: AssignmentID, assignment: Assignment) => void;
    onDelete: (assignmentID: AssignmentID) => void;
}


/**
 * EditAssignment Component
 * 
 * This component is responsible for editing an assignment in the course page.
 * 
 * 
 * @returns JSX.Element - The rendered component for the actions selection animation.
 */
const EditAssignment: ReactComponent<EditAssignmentProps> = ({ assignment, onSubmit, onDelete }) => {

    const [name, setName] = React.useState<string>(assignment.data.name);
    const [type, setType] = React.useState<AssignmentType>(assignment.data.type);
    const [dueDate, setDueDate] = React.useState<Date>(Time.toDate(assignment.data.dueDate));
    const [showPickerDate, setShowPickerDate] = useState<boolean>(false);
    const [showPickerTime, setShowPickerTime] = useState<boolean>(false);

    const onChangeDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDueDate(selectedDate);
            setShowPickerDate(false);
        }
    };

    const onChangeTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDueDate(selectedDate);
            setShowPickerTime(false);
        }
    };


    return (
        <>
            <TText testID={testIDs.addAssignmentTitle} size={24} bold mb={20} mx='md' pt={20}>{t(`course:add_assignment`)}</TText>
            <TText testID={testIDs.addAssignmentDescription} mx='md' mb={15}>{t(`course:add_assignment_title`)}</TText>

            <TScrollView testID={testIDs.scrollView}>

                <TView testID={testIDs.nameAndTypeView}>
                    <FancyTextInput
                        testID={testIDs.nameInput}
                        value={name}
                        onChangeText={n => setName(n)}
                        placeholder={t(`course:name_placeholder`)}
                        icon={icons.nameIcon}
                        label={t(`course:name_label`)}
                        error={name.length > MAX_ASSIGNMENT_NAME_LENGTH ? t(`course:name_too_long`) : name === "" ? t(`course:field_required`) : undefined}
                    />
                    <FancyButton
                        testID={testIDs.typeInput}
                        onPress={() => setType(type === 'quiz' ? 'submission' : 'quiz')}
                        backgroundColor={type === 'quiz' ? 'cherry' : 'yellow'}
                        textColor='constantWhite'
                        radius={'lg'}
                        mt={'md'}
                        mb={'sm'}
                    >
                        {type}
                    </FancyButton>
                </TView>


                <TView testID={testIDs.dueDateView} flexDirection='row' justifyContent='space-between' alignItems='center' mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}>
                    <TView testID={testIDs.dateInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={2} flexDirection='column' mr='sm'>
                        <TText testID={testIDs.dateTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:due_date_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.dateTouchableOpacity} onPress={() => setShowPickerDate(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'
                        >
                            <Icon testID={testIDs.dateIcon} name={icons.dateIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.dateText} ml={14} color={'text'}>{dueDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.timeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.timeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:due_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.timeTouchableOpacity} onPress={() => setShowPickerTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.timeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.timeText} ml={10} color={'text'}>{dueDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>
                </TView>


                {showPickerDate && (
                    <DateTimePicker
                        testID={testIDs.datePicker}
                        value={dueDate}
                        mode='date'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                setShowPickerDate(false);
                            } else {
                                onChangeDate(event, selectedDate);
                            }
                        }}
                    />
                )}

                {showPickerTime && (
                    <DateTimePicker
                        testID={testIDs.timePicker}
                        value={dueDate}
                        mode='time'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                setShowPickerTime(false);
                            } else {
                                onChangeTime(event, selectedDate);
                            }
                        }}
                    />
                )}

            </TScrollView >

            <TView
                testID={testIDs.finishViews}
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                style={{ marginBottom: 60 }}
            >
                {/* Bouton Submit */}
                <TTouchableOpacity
                    testID={testIDs.submitTouchableOpacity}
                    backgroundColor={name === "" || name.length > MAX_ASSIGNMENT_NAME_LENGTH ? 'text' : 'blue'}
                    disabled={name === "" || name.length > MAX_ASSIGNMENT_NAME_LENGTH}
                    onPress={() => onSubmit(assignment.id, { name, type, dueDate: Time.fromDate(dueDate) })}
                    style={{
                        flex: 1, // Chaque bouton occupe un espace égal
                        marginHorizontal: 10, // Espacement entre les boutons
                        padding: 12,
                        borderRadius: 9999,
                    }}
                >
                    <TView
                        testID={testIDs.submitView}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Icon testID={testIDs.submitIcon} name={icons.submitIcon} color="base" size="md" />
                        <TText testID={testIDs.submitText} color="base" ml={10}>
                            {t(`course:update_changes`)}
                        </TText>
                    </TView>
                </TTouchableOpacity>

                {/* Bouton Delete */}
                <TTouchableOpacity
                    testID={testIDs.deleteTouchableOpacity}
                    backgroundColor="red"
                    onPress={() => onDelete(assignment.id)}
                    style={{
                        flex: 1, // Même espace que le bouton précédent
                        marginHorizontal: 10,
                        padding: 12,
                        borderRadius: 9999,
                    }}
                >
                    <TView
                        testID={testIDs.deleteView}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Icon testID={testIDs.deleteIcon} name={icons.deleteIcon} color="base" size="md" />
                        <TText testID={testIDs.deleteText} color="base" ml={10}>
                            {t(`course:delete`)}
                        </TText>
                    </TView>
                </TTouchableOpacity>
            </TView>
        </>
    );
};

export default EditAssignment;