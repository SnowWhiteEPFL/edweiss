import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { IconType } from '@/constants/Style';
import { Material } from '@/model/school/courses';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import FancyTextInput from '../input/FancyTextInput';


// Icons
export const icons: { [key: string]: IconType } = {
    nameIcon: 'text',
    descriptionIcon: 'create-outline',
    dateIcon: 'calendar',
    timeIcon: 'alarm',
    finishIcon: 'checkmark-circle',
};

// Tests Tags
export const testIDs: { [key: string]: string } = {
    addMaterialTitle: 'add-material-title',
    addMaterialDescription: 'add-material-description',
    scrollView: 'scroll-view',
    titleAndDescriptionView: 'title-and-description-view',
    titleInput: 'title-input',
    descriptionInput: 'description-input',
    fromDateView: 'from-date-view',
    fromDateInput: 'from-date-input',
    fromDateTitle: 'from-date-title',
    fromDateTouchableOpacity: 'from-date-touchable-opacity',
    fromDateIcon: 'from-date-icon',
    fromDateText: 'from-date-text',
    fromTimeInput: 'from-time-input',
    fromTimeTitle: 'from-time-title',
    fromTimeTouchableOpacity: 'from-time-touchable-opacity',
    fromTimeIcon: 'from-time-icon',
    fromTimeText: 'from-time-text',
    toDateView: 'to-date-view',
    toDateInput: 'to-date-input',
    toDateTitle: 'to-date-title',
    toDateTouchableOpacity: 'to-date-touchable-opacity',
    toDateIcon: 'to-date-icon',
    toDateText: 'to-date-text',
    toTimeInput: 'to-time-input',
    toTimeTitle: 'to-time-title',
    toTimeTouchableOpacity: 'to-time-touchable-opacity',
    toTimeIcon: 'to-time-icon',
    toTimeText: 'to-time-text',
    fromDatePicker: "fromDate-dateTimePicker",
    fromTimePicker: "fromTime-dateTimePicker",
    toDatePicker: "toDate-dateTimePicker",
    toTimePicker: "toTime-dateTimePicker",
    finishTouchableOpacity: 'finish-touchable-opacity',
    finishView: 'finish-view',
    finishIcon: 'finish-icon',
    finishText: 'finish-text',
};


interface AddMaterialProps {
    onSubmit: (material: Material) => void;
}


/**
 * AddMaterial Component
 * 
 * This component is responsible for displaying the page to add a material to the course.
 * 
 * @argument onSubmit - The function to be called when the user submits the material.
 * 
 * 
 * @returns JSX.Element - The rendered component for the material creation inner-page.
 */
const AddMaterial: ReactComponent<AddMaterialProps> = ({ onSubmit }) => {

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [fromDateChanged, setFromDateChanged] = useState(false);
    const [fromTimeChanged, setFromTimeChanged] = useState(false);
    const [toDateChanged, setToDateChanged] = useState(false);
    const [toTimeChanged, setToTimeChanged] = useState(false);
    const [showPickerFromDate, setShowPickerFromDate] = useState(false);
    const [showPickerFromTime, setShowPickerFromTime] = useState(false);
    const [showPickerToDate, setShowPickerToDate] = useState(false);
    const [showPickerToTime, setShowPickerToTime] = useState(false);

    const onChangeFromDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setFromDateChanged(true);
            setFromDate(selectedDate);
            setShowPickerFromDate(false);
        }
    };

    const onChangeFromTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setFromTimeChanged(true);
            setFromDate(selectedDate);
            setShowPickerFromTime(false);
        }
    };

    const onChangeToDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setToDateChanged(true);
            setToDate(selectedDate);
            setShowPickerToDate(false);
        }
    };

    const onChangeToTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setToTimeChanged(true);
            setToDate(selectedDate);
            setShowPickerToTime(false);
        }
    };


    return (
        <>
            <TText testID={testIDs.addMaterialTitle} size={24} bold mb={20} mx='md' pt={20}>{t(`course:add_material`)}</TText>
            <TText testID={testIDs.addMaterialDescription} mx='md' mb={15}>{t(`course:add_material_title`)}</TText>

            <TScrollView testID={testIDs.scrollView}>

                <TView testID={testIDs.titleAndDescriptionView}>
                    <FancyTextInput
                        testID={testIDs.titleInput}
                        label={t(`course:material_title_label`)}
                        value={title}
                        onChangeText={n => setTitle(n)}
                        placeholder={t(`course:material_title_placeholder`)}
                        icon={icons.nameIcon}
                    />
                    <FancyTextInput
                        testID={testIDs.descriptionInput}
                        label={t(`course:material_description_label`)}
                        value={description}
                        onChangeText={n => setDescription(n)}
                        placeholder={t(`course:material_description_placeholder`)}
                        icon={icons.descriptionIcon}
                        multiline
                        numberOfLines={4}
                        mt={'md'}
                        mb={'sm'}
                    />
                </TView>


                <TView testID={testIDs.fromDateView} flexDirection='row' justifyContent='space-between' alignItems='center' mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}>
                    <TView testID={testIDs.fromDateInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={2} flexDirection='column' mr='sm'>
                        <TText testID={testIDs.fromDateTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:from_date_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.fromDateTouchableOpacity} onPress={() => setShowPickerFromDate(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'
                        >
                            <Icon testID={testIDs.fromDateIcon} name={icons.dateIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.fromDateText} ml={14} color={fromDateChanged ? 'text' : 'overlay0'}>{fromDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.fromTimeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.fromTimeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:from_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.fromTimeTouchableOpacity} onPress={() => setShowPickerFromTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.fromTimeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.fromTimeText} ml={10} color={fromTimeChanged ? 'text' : 'overlay0'}>{fromDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>
                </TView>

                <TView testID={testIDs.toDateView} flexDirection='row' justifyContent='space-between' alignItems='center' mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}>
                    <TView testID={testIDs.toDateInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={2} flexDirection='column' mr='sm'>
                        <TText testID={testIDs.toDateTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:to_date_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.toDateTouchableOpacity} onPress={() => setShowPickerToDate(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'
                        >
                            <Icon testID={testIDs.toDateIcon} name={icons.dateIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.toDateText} ml={14} color={toDateChanged ? 'text' : 'overlay0'}>{toDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.toTimeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.toTimeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:to_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.toTimeTouchableOpacity} onPress={() => setShowPickerToTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.toTimeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.toTimeText} ml={10} color={toTimeChanged ? 'text' : 'overlay0'}>{toDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>
                </TView>


                {showPickerFromDate && (
                    <DateTimePicker
                        testID={testIDs.fromDatePicker}
                        value={fromDate}
                        mode='date'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                setShowPickerFromDate(false);
                            } else {
                                onChangeFromDate(event, selectedDate);
                            }
                        }}
                    />
                )}

                {showPickerFromTime && (
                    <DateTimePicker
                        testID={testIDs.fromTimePicker}
                        value={fromDate}
                        mode='time'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                setShowPickerFromTime(false);
                            } else {
                                onChangeFromTime(event, selectedDate);
                            }
                        }}
                    />
                )}


                {showPickerToDate && (
                    <DateTimePicker
                        testID={testIDs.toDatePicker}
                        value={toDate}
                        mode='date'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                setShowPickerToDate(false);
                            } else {
                                onChangeToDate(event, selectedDate);
                            }
                        }}
                    />
                )}

                {showPickerToTime && (
                    <DateTimePicker
                        testID={testIDs.toTimePicker}
                        value={toDate}
                        mode='time'
                        is24Hour={true}
                        display="default"
                        onChange={(event, selectedDate) => {
                            if (event.type === "dismissed") {
                                setShowPickerToTime(false);
                            } else {
                                onChangeToTime(event, selectedDate);
                            }
                        }}
                    />
                )}

            </TScrollView >

            <TTouchableOpacity
                testID={testIDs.finishTouchableOpacity}
                backgroundColor={(title === "" || !fromDateChanged || !fromTimeChanged || !toDateChanged || !toTimeChanged) ? 'text' : 'blue'}
                disabled={title === "" || !fromDateChanged || !fromTimeChanged || !toDateChanged || !toTimeChanged}
                onPress={() => { onSubmit({ title: title, description: description, from: Time.fromDate(fromDate), to: Time.fromDate(toDate), docs: [] }); }}
                ml={100} mr={100} p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 60, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
                <TView testID={testIDs.finishView} flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon testID={testIDs.finishIcon} name={icons.finishIcon} color='base' size={'md'} />
                    <TText testID={testIDs.finishText} color='base' ml={10}>{t(`course:upload_material`)}</TText>
                </TView>
            </TTouchableOpacity >
        </>
    );
};

export default AddMaterial;