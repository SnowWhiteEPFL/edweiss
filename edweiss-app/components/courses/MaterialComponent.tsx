import ReactComponent from '@/constants/Component';

import { DocumentRouteSignature } from '@/app/(app)/courses/[id]/materials/[materialId]';
import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { IconType } from '@/constants/Style';
import { pushWithParameters } from '@/hooks/routeParameters';
import { Material, MaterialDocument, MaterialID, MaterialType, MAX_DOCUMENT_TITLE_LENGTH, MAX_MATERIAL_DESCRIPTION_LENGTH, MAX_MATERIAL_TITLE_LENGTH } from '@/model/school/courses';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import TScrollView from '../core/containers/TScrollView';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import For from '../core/For';
import Icon from '../core/Icon';
import FancyButton from '../input/FancyButton';
import FancyTextInput from '../input/FancyTextInput';
import DocumentDisplay from './DocumentDisplay';

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
    addMaterialTitle: 'add-material-title',
    addMaterialDescription: 'add-material-description',
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
    submitIcon: 'submit-icon',
    deleteTouchableOpacity: 'delete-touchable-opacity',
    deleteView: 'delete-view',
    deleteText: 'delete-text',
    deleteIcon: 'delete-icon',
};

type MaterialMode = 'add' | 'edit';

interface MaterialProps {
    mode: MaterialMode;
    onSubmit: (material: Material, materialID?: MaterialID) => void;
    onDelete?: (materialID: MaterialID) => void;
    material?: { id: string, data: Material };
}


/**
 * MaterialComponent
 * 
 * This component is responsible for displaying the page to add or edit a material to the course.
 * 
 * @param onSubmit - The function to be called when the user submits the material.
 * @param mode - The mode of the component (add or edit).
 * @param onDelete - The function to be called when the user deletes the material.
 * @param material - The material to be edited.
 * 
 * 
 * @returns JSX.Element - The rendered component for the material creation inner-page.
 */
const MaterialComponent: ReactComponent<MaterialProps> = ({ mode, onSubmit, onDelete, material }) => {

    const [title, setTitle] = useState<string>(material?.data.title ?? "");
    const [description, setDescription] = useState<string>(material?.data.description ?? "");
    const [fromDate, setFromDate] = useState<Date>(material ? Time.toDate(material.data.from) : new Date());
    const [toDate, setToDate] = useState<Date>(material ? Time.toDate(material.data.to) : new Date());
    const [docs, setDocs] = useState<MaterialDocument[]>(material?.data.docs ?? []);
    const [docTitle, setDocTitle] = useState<string>('');
    const [docType, setDocType] = useState<MaterialType>('slide');
    const [docUri, setDocUri] = useState<string>('');
    const [titleChanged, setTitleChanged] = useState<boolean>(false);
    const [fromDateChanged, setFromDateChanged] = useState<boolean>(false);
    const [fromTimeChanged, setFromTimeChanged] = useState<boolean>(false);
    const [toDateChanged, setToDateChanged] = useState<boolean>(false);
    const [toTimeChanged, setToTimeChanged] = useState<boolean>(false);
    const [docTitleChanged, setDocTitleChanged] = useState<boolean>(false);
    const [showPickerFromDate, setShowPickerFromDate] = useState<boolean>(false);
    const [showPickerFromTime, setShowPickerFromTime] = useState<boolean>(false);
    const [showPickerToDate, setShowPickerToDate] = useState<boolean>(false);
    const [showPickerToTime, setShowPickerToTime] = useState<boolean>(false);

    const [showAddDocument, setShowAddDocument] = useState<boolean>(false);

    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const typeOptions: { type: MaterialType, color: Color }[] = [
        { type: 'slide', color: 'cherry' },
        { type: 'exercise', color: 'maroon' },
        { type: 'image', color: 'yellow' },
        { type: 'other', color: 'sapphire' },
        { type: 'feedback', color: 'lavender' },
    ];

    useEffect(() => {
        const isInvalid =
            mode === 'add' &&
            (
                !fromDateChanged ||
                !fromTimeChanged ||
                !toDateChanged ||
                !toTimeChanged ||
                (toDateChanged && fromDateChanged && toDate.getTime() < fromDate.getTime())
            ) ||
            title === "" ||
            title.length > MAX_MATERIAL_TITLE_LENGTH ||
            description.length > MAX_MATERIAL_DESCRIPTION_LENGTH;

        setIsButtonDisabled(isInvalid);
    }, [
        mode,
        fromDateChanged,
        fromTimeChanged,
        toDateChanged,
        toTimeChanged,
        fromDate,
        toDate,
        title,
        description,
        MAX_MATERIAL_TITLE_LENGTH,
        MAX_MATERIAL_DESCRIPTION_LENGTH
    ]);

    const onChangeTitle = (text: string) => {
        setTitleChanged(true);
        setTitle(text);
    }

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

    const resetDocument = () => {
        setDocTitle('');
        setDocType('slide');
        setDocUri('');
        setDocTitleChanged(false);
    }

    return (
        <>
            <TScrollView testID={testIDs.scrollView}>

                <TText
                    testID={mode === 'add' ? testIDs.addMaterialTitle : testIDs.editMaterialTitle}
                    size={24} bold mb={20} mx='md' pt={20}
                >
                    {mode === 'add' ? t('course:add_material') : t('course:edit_material')}
                </TText>

                <TText
                    testID={mode === 'add' ? testIDs.addMaterialDescription : testIDs.editMaterialDescription}
                    mx='md' mb={15}
                >
                    {mode === 'add' ? t('course:add_material_title') : t('course:edit_material_title')}
                </TText>

                <TView testID={testIDs.titleAndDescriptionView}>
                    <FancyTextInput
                        testID={testIDs.titleInput}
                        label={t('course:material_title_label')}
                        value={title}
                        onChangeText={onChangeTitle}
                        placeholder={t('course:material_title_placeholder')}
                        icon={icons.nameIcon}
                        error={
                            title.length > MAX_MATERIAL_TITLE_LENGTH
                                ? t('course:title_too_long')
                                : title === '' && (mode === 'edit' || titleChanged)
                                    ? t('course:field_required')
                                    : undefined
                        }
                    />
                    <FancyTextInput
                        testID={testIDs.descriptionInput}
                        label={t('course:material_description_label')}
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t('course:material_description_placeholder')}
                        icon={icons.descriptionIcon}
                        multiline
                        numberOfLines={4}
                        mt="md"
                        mb="sm"
                        error={
                            description.length > MAX_MATERIAL_DESCRIPTION_LENGTH
                                ? t('course:description_too_long')
                                : undefined
                        }
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
                            <TText testID={testIDs.fromDateText} ml={14} color={!fromDateChanged && mode == 'add' ? 'overlay0' : 'text'}>{fromDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.fromTimeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.fromTimeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:from_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.fromTimeTouchableOpacity} onPress={() => setShowPickerFromTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.fromTimeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.fromTimeText} ml={10} color={!fromTimeChanged && mode == 'add' ? 'overlay0' : 'text'}>{fromDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
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
                            <TText testID={testIDs.toDateText} ml={14} color={!toDateChanged && mode == 'add' ? 'overlay0' : 'text'}>{toDate.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>

                    <TView testID={testIDs.toTimeInput} backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>
                        <TText testID={testIDs.toTimeTitle} ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`course:to_time_label`)}</TText>
                        <TTouchableOpacity testID={testIDs.toTimeTouchableOpacity} onPress={() => setShowPickerToTime(true)}
                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>
                            <Icon testID={testIDs.toTimeIcon} name={icons.timeIcon} size='md' color='overlay0' />
                            <TText testID={testIDs.toTimeText} ml={10} color={!toTimeChanged && mode == 'add' ? 'overlay0' : 'text'}>{toDate.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>
                </TView>

                {toDateChanged && fromDateChanged && toDate.getTime() < fromDate.getTime() && <TText align='center' mx='md' color='red'>{t(`course:to_date_before_from_date`)}</TText>}


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

                <TView flexDirection='row' alignItems='center' justifyContent='space-between' mx='md'>
                    <TText
                        testID={testIDs.documentsTitle}
                        size={24} bold mb={20} pt={30}
                    >
                        {t('course:documents_title')}
                    </TText>

                    <TTouchableOpacity
                        onPress={() => { setShowAddDocument(!showAddDocument); resetDocument(); }}
                        radius={'xl'}
                        backgroundColor='blue'
                        flexDirection='row'
                        alignItems='center'
                        p={5}
                        mt={10}
                    >
                        <Icon
                            name='add-circle'
                            color='constantWhite'
                            size='lg'
                        />
                        <TText
                            color='constantWhite'
                            ml={5}
                        >
                            {t('course:add_document')}
                        </TText>
                    </TTouchableOpacity>
                </TView>

                {showAddDocument &&
                    <TView pb={20}>
                        <FancyTextInput
                            testID={testIDs.docTitleInput}
                            label={t('course:document_title_label')}
                            value={docTitle}
                            onChangeText={n => { setDocTitleChanged(true); setDocTitle(n) }}
                            placeholder={t('course:document_title_placeholder')}
                            icon={icons.nameIcon}
                            error={docTitle.length > MAX_DOCUMENT_TITLE_LENGTH ? t(`course:title_too_long`) : docTitleChanged && docTitle == "" ? t(`course:field_required`) : undefined}
                        />
                        <FancyButton
                            testID={testIDs.sectionInput}
                            onPress={() => {
                                setDocType(typeOptions[(typeOptions.findIndex(option => option.type === docType) + 1) % typeOptions.length].type);
                            }}
                            backgroundColor={typeOptions[typeOptions.findIndex(option => option.type === docType)].color}
                            textColor='constantWhite'
                            radius={'lg'}
                            mt={'md'}
                            mb={'sm'}
                        >
                            {docType}
                        </FancyButton>
                        <TView flexDirection='row' justifyContent='flex-start' alignItems='center' mt='md' mx='md' pb={20}>
                            <TTouchableOpacity
                                onPress={() => {

                                }}
                                radius={'md'}
                                backgroundColor='crust'
                                flexDirection='row'
                                alignItems='center'
                                p={8}
                                px={15}
                            >
                                <Icon
                                    name='document-attach-outline'
                                    color='subtext0'
                                    size='lg'
                                />
                                <TText
                                    color='text'
                                    ml={10}
                                >
                                    {t('course:browse_document')}
                                </TText>
                            </TTouchableOpacity>
                            <TText
                                ml={10}
                                color='subtext0'
                            >
                                {docUri}
                            </TText>
                        </TView>

                        <FancyButton
                            testID={testIDs.saveUploadButton}
                            onPress={() => {

                            }}
                            backgroundColor='blue'
                            textColor='constantWhite'
                            radius={'xl'}
                            mt={'md'}
                            mb={'sm'}
                        >
                            {t('course:save_upload')}
                        </FancyButton>
                    </TView>
                }

                <TView
                    pb={60}
                    mx={20}
                >
                    <For
                        each={docs.length > 0 ? docs : undefined}
                        fallback={<TText size={16} testID={testIDs.noAssignmentDue}>{t('course:no_assignment_due')}</TText>}
                    >{(doc) => (
                        <DocumentDisplay
                            doc={doc}
                            isTeacher
                            onPress={() => {
                                console.log(`Click on ${doc.title}`);
                                pushWithParameters(DocumentRouteSignature, { document: doc });
                            }}
                            onDelete={() => setDocs(docs.filter(d => d !== doc))}
                        />
                    )}
                    </For>

                </TView>

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
                    backgroundColor={isButtonDisabled ? 'text' : 'blue'}
                    disabled={isButtonDisabled}
                    onPress={() => material
                        ? onSubmit(
                            {
                                title: title,
                                description: description,
                                from: Time.fromDate(fromDate),
                                to: Time.fromDate(toDate),
                                docs: []
                            },
                            material.id
                        )
                        : onSubmit(
                            {
                                title: title,
                                description: description,
                                from: Time.fromDate(fromDate),
                                to: Time.fromDate(toDate),
                                docs: docs
                            }
                        )
                    }
                    flex={1}
                    mx={10}
                    p={12}
                    radius={'xl'}
                >
                    <TView
                        testID={testIDs.submitView}
                        flexDirection="row"
                        justifyContent="center"
                        alignItems="center"
                    >
                        <Icon
                            testID={testIDs.submitIcon}
                            name={icons.submitIcon}
                            color="base"
                            size="lg"
                        />
                        <TText
                            testID={testIDs.submitText}
                            color="base"
                            ml={10}
                        >
                            {mode === 'add' ? t('course:upload_material') : t('course:update_changes')}
                        </TText>
                    </TView>
                </TTouchableOpacity>

                {mode == 'edit' && onDelete &&
                    <TTouchableOpacity
                        testID={testIDs.deleteTouchableOpacity}
                        backgroundColor="red"
                        onPress={() => material && onDelete(material.id)}
                        flex={1} mx={10} p={12} radius={'xl'}
                    >
                        <TView
                            testID={testIDs.deleteView}
                            flexDirection="row"
                            justifyContent="center"
                            alignItems="center"
                        >
                            <Icon testID={testIDs.deleteIcon} name={icons.deleteIcon} color="base" size="lg" />
                            <TText testID={testIDs.deleteText} color="base" ml={10}>
                                {t(`course:delete`)}
                            </TText>
                        </TView>
                    </TTouchableOpacity>}
            </TView>
        </>
    );
}

export default MaterialComponent;
