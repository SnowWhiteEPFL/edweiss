import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { IconType } from '@/constants/Style';
import { Assignment, AssignmentID, AssignmentType, MAX_ASSIGNMENT_NAME_LENGTH } from '@/model/school/courses';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import FancyButton from '../input/FancyButton';
import FancyTextInput from '../input/FancyTextInput';


// Icons
export const icons: { [key: string]: IconType } = {
    nameIcon: 'text',
    dateIcon: 'calendar',
    timeIcon: 'alarm',
    finishIcon: 'checkmark-circle',
    deleteIcon: 'trash',
};

// Tests Tags
export const testIDs: { [key: string]: string } = {
    addAssignmentTitle: 'add-assignment-title',
    addAssignmentDescription: 'add-assignment-description',
    editAssignmentTitle: 'edit-assignment-title',
    editAssignmentDescription: 'edit-assignment-description',
    scrollView: 'scroll-view',
    nameAndTypeView: 'name-and-type-view',
    nameInput: 'name-input',
    typeInput: 'type-input',
    dueDateView: 'due-date-view',
    dateInput: 'date-input',
    dateTitle: 'date-title',
    dateTouchableOpacity: 'date-touchable-opacity',
    dateIcon: 'date-icon',
    dateText: 'date-text',
    timeInput: 'time-input',
    timeTitle: 'time-title',
    timeTouchableOpacity: 'time-touchable-opacity',
    timeIcon: 'time-icon',
    timeText: 'time-text',
    datePicker: "dateTimePicker1",
    timePicker: "dateTimePicker2",
    finishViews: 'finish-views',
    submitTouchableOpacity: 'submit-touchable-opacity',
    submitView: 'submit-view',
    submitIcon: 'submit-icon',
    submitText: 'submit-text',
    deleteTouchableOpacity: 'delete-touchable-opacity',
    deleteView: 'delete-view',
    deleteText: 'delete-text',
    deleteIcon: 'delete-icon',
};

type AssignmentMode = 'edit' | 'add';

interface EditAssignmentProps {
    mode: AssignmentMode;
    onSubmit: (assignment: Assignment, assignmentID?: AssignmentID) => void;
    onDelete?: (assignmentID: AssignmentID) => void;
    assignment?: { id: string, data: Assignment };
}


/**
 * AssignmentComponent Component
 * 
 * This component is responsible for adding or editing an assignment in the course page.
 * 
 * @param mode - The mode of the assignment component.
 * @param onSubmit - The function to call when the user submits the assignment.
 * @param onDelete - The function to call when the user deletes the assignment.
 * @param assignment - The assignment data to be edited.
 * 
 * @returns JSX.Element - The rendered component for the assignment editing.
 */
const AssignmentComponent: ReactComponent<EditAssignmentProps> = ({ mode, onSubmit, onDelete, assignment }) => {

    const [state, setState] = useState({
        name: assignment && mode == 'edit' ? assignment.data.name : "",
        type: assignment && mode == 'edit' ? assignment.data.type : 'quiz',
        dueDate: assignment && mode == 'edit' ? Time.toDate(assignment.data.dueDate) : new Date(),
        nameChanged: false,
        dateChanged: false,
        timeChanged: false,
        showPickerDate: false,
        showPickerTime: false,
        isButtonDisabled: true,
    });

    type StateType = {
        name: string;
        type: AssignmentType;
        dueDate: Date;
        nameChanged: boolean;
        dateChanged: boolean;
        timeChanged: boolean;
        showPickerDate: boolean;
        showPickerTime: boolean;
        isButtonDisabled: boolean;
    };

    const updateState = <K extends keyof StateType>(key: K, value: StateType[K]) => {
        setState((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        const isInvalid =
            (mode === 'add' && (!state.dateChanged || !state.timeChanged)) ||
            state.name === "" ||
            state.name.length > MAX_ASSIGNMENT_NAME_LENGTH;

        updateState('isButtonDisabled', isInvalid);
    }, [mode, state.dateChanged, state.timeChanged, state.name, MAX_ASSIGNMENT_NAME_LENGTH]);


    const onChangeDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            updateState('dateChanged', true);
            updateState('dueDate', selectedDate);
            updateState('showPickerDate', false);
        }
    };

    const onChangeTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            updateState('timeChanged', true);
            updateState('dueDate', selectedDate);
            updateState('showPickerTime', false);
        }
    };


    return (
        <>
            <TText
                testID={mode == 'add' ? testIDs.addAssignmentTitle : mode == 'edit' ? testIDs.editAssignmentTitle : undefined}
                size={24} bold mb={20} mx='md' pt={20}
            >
                {mode == 'add' ? t(`course:add_assignment`) : mode == 'edit' ? t(`course:edit_assignment`) : undefined}
            </TText>
            <TText
                testID={mode == 'add' ? testIDs.addAssignmentDescription : mode == 'edit' ? testIDs.editAssignmentDescription : undefined}
                mx='md' mb={15}
            >
                {mode == 'add' ? t(`course:add_assignment_title`) : mode == 'edit' ? t(`course:edit_assignment_title`) : undefined}
            </TText>

            <TScrollView testID={testIDs.scrollView}>

                <TView testID={testIDs.nameAndTypeView}>
                    <FancyTextInput
                        testID={testIDs.nameInput}
                        value={state.name}
                        onChangeText={n => { updateState('nameChanged', true); updateState('name', n); }}
                        placeholder={t(`course:name_placeholder`)}
                        icon={icons.nameIcon}
                        label={t(`course:name_label`)}
                        error={state.name.length > MAX_ASSIGNMENT_NAME_LENGTH ? t(`course:name_too_long`) : (state.name === "" && (state.nameChanged || mode == 'edit')) ? t(`course:field_required`) : undefined}
                    />

                    <FancyButton
                        testID={testIDs.typeInput}
                        onPress={() => updateState('type', state.type === 'quiz' ? 'submission' : 'quiz')}
                        backgroundColor={state.type === 'quiz' ? 'cherry' : 'yellow'}
                        textColor='constantWhite'
                        radius={'lg'}
                        mt={'md'}
                        mb={'sm'}
                    >
                        {state.type}
                    </FancyButton>
                </TView>


                <TView testID={testIDs.dueDateView} flexDirection='row' justifyContent='space-between' alignItems='center' mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}>
                    <TView testID={testIDs.dateInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={2} flexDirection='column' mr='sm'>
                        <TText testID={testIDs.dateTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:due_date_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.dateTouchableOpacity} onPress={() => updateState('showPickerDate', true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'
                        >
                            <Icon testID={testIDs.dateIcon} name={icons.dateIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.dateText} ml={14} color={!state.dateChanged && mode == 'add' ? 'overlay0' : 'text'}>{state.dueDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.timeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.timeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:due_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.timeTouchableOpacity} onPress={() => updateState('showPickerTime', true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.timeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.timeText} ml={10} color={!state.timeChanged && mode == 'add' ? 'overlay0' : 'text'}>{state.dueDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>
                </TView>


                {state.showPickerDate && (
                    <DateTimePicker
                        testID={testIDs.datePicker}
                        value={state.dueDate}
                        mode='date'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                updateState('showPickerDate', false);
                            } else {
                                onChangeDate(event, selectedDate);
                            }
                        }}
                    />
                )}

                {state.showPickerTime && (
                    <DateTimePicker
                        testID={testIDs.timePicker}
                        value={state.dueDate}
                        mode='time'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                updateState('showPickerTime', false);
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
                    backgroundColor={state.isButtonDisabled ? 'text' : 'blue'}
                    disabled={state.isButtonDisabled}
                    onPress={() => assignment ? onSubmit({ name: state.name, type: state.type, dueDate: Time.fromDate(state.dueDate) }, assignment.id) : onSubmit({ name: state.name, type: state.type, dueDate: Time.fromDate(state.dueDate) })}
                    flex={1} mx={10} p={12} radius={'xl'}
                >
                    <TView
                        testID={testIDs.submitView}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Icon testID={testIDs.submitIcon} name={icons.submitIcon} color="base" size="md" />
                        <TText testID={testIDs.submitText} color="base" ml={10}>
                            {mode == 'add' ? t(`course:upload_assignment`) : mode == 'edit' ? t(`course:update_changes`) : undefined}
                        </TText>
                    </TView>
                </TTouchableOpacity>

                {mode == 'edit' && onDelete &&
                    <TTouchableOpacity
                        testID={testIDs.deleteTouchableOpacity}
                        backgroundColor="red"
                        onPress={() => assignment && onDelete(assignment.id)}
                        flex={1} mx={10} p={12} radius={'xl'}
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
                }
            </TView>
        </>
    );
};

export default AssignmentComponent;