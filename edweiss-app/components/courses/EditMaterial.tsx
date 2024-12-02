import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { IconType } from '@/constants/Style';
import { Material, MaterialID, MAX_MATERIAL_DESCRIPTION_LENGTH, MAX_MATERIAL_TITLE_LENGTH } from '@/model/school/courses';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import Icon from '../core/Icon';
import FancyTextInput from '../input/FancyTextInput';


// Icons
export const icons: { [key: string]: IconType } = {
    nameIcon: 'text-outline',
    descriptionIcon: 'create-outline',
    dateIcon: 'calendar',
    timeIcon: 'alarm',
    submitIcon: 'checkmark-circle',
    deleteIcon: 'trash-outline',
};

// Tests Tags
export const testIDs: { [key: string]: string } = {
    editMaterialTitle: 'edit-material-title',
    editMaterialDescription: 'edit-material-description',
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
    fromDatePicker: 'from-date-picker',
    fromTimePicker: 'from-time-picker',
    toDatePicker: 'to-date-picker',
    toTimePicker: 'to-time-picker',
    finishViews: 'finish-views',
    submitTouchableOpacity: 'submit-touchable-opacity',
    submitView: 'submit-view',
    submitText: 'submit-text',
    deleteTouchableOpacity: 'delete-touchable-opacity',
    deleteView: 'delete-view',
    deleteText: 'delete-text',
};


interface EditMaterialProps {
    material: { id: string, data: Material };
    onSubmit: (materialID: MaterialID, material: Material) => void;
    onDelete: (materialID: MaterialID) => void;
}


/**
 * EditMaterial Component
 * 
 * This component is responsible for editing a material in the course page.
 * 
 * 
 * @returns JSX.Element - The rendered component for the actions selection animation.
 */
const EditMaterial: ReactComponent<EditMaterialProps> = ({ material, onSubmit, onDelete }) => {

    const [title, setTitle] = useState<string>(material.data.title);
    const [description, setDescription] = useState<string>(material.data.description);
    const [fromDate, setFromDate] = useState(Time.toDate(material.data.from));
    const [toDate, setToDate] = useState(Time.toDate(material.data.to));
    const [showPickerFromDate, setShowPickerFromDate] = useState(false);
    const [showPickerFromTime, setShowPickerFromTime] = useState(false);
    const [showPickerToDate, setShowPickerToDate] = useState(false);
    const [showPickerToTime, setShowPickerToTime] = useState(false);

    const onChangeFromDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setFromDate(selectedDate);
            setShowPickerFromDate(false);
        }
    };

    const onChangeFromTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setFromDate(selectedDate);
            setShowPickerFromTime(false);
        }
    };

    const onChangeToDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setToDate(selectedDate);
            setShowPickerToDate(false);
        }
    };

    const onChangeToTime = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setToDate(selectedDate);
            setShowPickerToTime(false);
        }
    };


    return (
        <>
            <TText testID={testIDs.editMaterialTitle} size={24} bold mb={20} mx='md' pt={20}>{t(`course:edit_material`)}</TText>
            <TText testID={testIDs.editMaterialDescription} mx='md' mb={15}>{t(`course:edit_material_title`)}</TText>

            <TScrollView testID={testIDs.scrollView}>

                <TView testID={testIDs.titleAndDescriptionView}>
                    <FancyTextInput
                        testID={testIDs.titleInput}
                        label={t(`course:material_title_label`)}
                        value={title}
                        onChangeText={n => setTitle(n)}
                        placeholder={t(`course:material_title_placeholder`)}
                        icon={icons.nameIcon}
                        error={title.length > MAX_MATERIAL_TITLE_LENGTH ? t(`course:title_too_long`) : title === "" ? t(`course:field_required`) : undefined}
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
                        error={description.length > MAX_MATERIAL_DESCRIPTION_LENGTH ? t(`course:description_too_long`) : undefined}
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
                            <TText testID={testIDs.fromDateText} ml={14} color={'text'}>{fromDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.fromTimeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.fromTimeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:from_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.fromTimeTouchableOpacity} onPress={() => setShowPickerFromTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.fromTimeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.fromTimeText} ml={10} color={'text'}>{fromDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
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
                            <TText testID={testIDs.toDateText} ml={14} color={'text'}>{toDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.toTimeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.toTimeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:to_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.toTimeTouchableOpacity} onPress={() => setShowPickerToTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.toTimeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.toTimeText} ml={10} color={'text'}>{toDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
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

            <TView
                testID={testIDs.finishViews}
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                style={{ marginBottom: 60 }}
            >
                <TTouchableOpacity
                    testID={testIDs.submitTouchableOpacity}
                    backgroundColor={(title === "" || title.length > MAX_MATERIAL_TITLE_LENGTH || description.length > MAX_MATERIAL_DESCRIPTION_LENGTH) ? 'text' : 'blue'}
                    disabled={title === "" || title.length > MAX_MATERIAL_TITLE_LENGTH || description.length > MAX_MATERIAL_DESCRIPTION_LENGTH}
                    onPress={() => onSubmit(material.id, { title: title, description: description, from: Time.fromDate(fromDate), to: Time.fromDate(toDate), docs: [] })}
                    style={{
                        flex: 1,
                        marginHorizontal: 10,
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

                <TTouchableOpacity
                    testID={testIDs.deleteTouchableOpacity}
                    backgroundColor="red"
                    onPress={() => onDelete(material.id)}
                    style={{
                        flex: 1,
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

export default EditMaterial;