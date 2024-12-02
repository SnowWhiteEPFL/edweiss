import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { IconType } from '@/constants/Style';
import { Assignment, AssignmentType, MAX_ASSIGNMENT_NAME_LENGTH } from '@/model/school/courses';
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
    nameIcon: 'text',
    dateIcon: 'calendar',
    timeIcon: 'alarm',
    finishIcon: 'checkmark-circle',
};

// Tests Tags
export const testIDs: { [key: string]: string } = {
    addAssignmentTitle: 'add-assignment-title',
    addAssignmentDescription: 'add-assignment-description',
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
    finishTouchableOpacity: 'finish-touchable-opacity',
    finishView: 'finish-view',
    finishIcon: 'finish-icon',
    finishText: 'finish-text',
};


interface AddAssignmentProps {
    onSubmit: (assignment: Assignment) => void;
}


/**
 * AddAssignment Component
 * 
 * This component is responsible for displaying the page to add an assignment to the course.
 * 
 * @param onSubmit - The function to be called when the user submits the assignment.
 * 
 * 
 * @returns JSX.Element - The rendered component for the assignment creation inner-page.
 */
const AddAssignment: ReactComponent<AddAssignmentProps> = ({ onSubmit }) => {

    const [name, setName] = useState("");
    const [type, setType] = useState<AssignmentType>('quiz');
    const [date, setDate] = useState(new Date());
    const [dateChanged, setDateChanged] = useState(false);
    const [timeChanged, setTimeChanged] = useState(false);
    const [showPickerDate, setShowPickerDate] = useState(false);
    const [showPickerTime, setShowPickerTime] = useState(false);

    const onChangeDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDateChanged(true);
            setDate(selectedDate);
            setShowPickerDate(false);
        }
    };

    const onChangeTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setTimeChanged(true);
            setDate(selectedDate);
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
                        error={name.length > MAX_ASSIGNMENT_NAME_LENGTH ? t(`course:name_too_long`) : undefined}
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
                            <TText testID={testIDs.dateText} ml={14} color={dateChanged ? 'text' : 'overlay0'}>{date.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.timeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.timeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:due_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.timeTouchableOpacity} onPress={() => setShowPickerTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.timeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.timeText} ml={10} color={timeChanged ? 'text' : 'overlay0'}>{date.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>
                </TView>


                {showPickerDate && (
                    <DateTimePicker
                        testID={testIDs.datePicker}
                        value={date}
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
                        value={date}
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

            <TTouchableOpacity
                testID={testIDs.finishTouchableOpacity}
                backgroundColor={(name === "" || !dateChanged || !timeChanged || name.length > MAX_ASSIGNMENT_NAME_LENGTH) ? 'text' : 'blue'}
                disabled={name === "" || !dateChanged || !timeChanged || name.length > MAX_ASSIGNMENT_NAME_LENGTH}
                onPress={() => { onSubmit({ type: type, name: name, dueDate: Time.fromDate(date) }); }}
                ml={100} mr={100} p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
                <TView testID={testIDs.finishView} flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon testID={testIDs.finishIcon} name={icons.finishIcon} color='base' size={'md'} />
                    <TText testID={testIDs.finishText} color='base' ml={10}>{t(`course:upload_assignment`)}</TText>
                </TView>
            </TTouchableOpacity >
        </>
    );
};

export default AddAssignment;