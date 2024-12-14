import ReactComponent from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { deleteDirectoryFromFirebase, deleteFromFirebase, uploadToFirebase } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import { IconType } from '@/constants/Style';
import { Material, MaterialDocument, MaterialID, MaterialType, MAX_DOCUMENT_TITLE_LENGTH, MAX_MATERIAL_DESCRIPTION_LENGTH, MAX_MATERIAL_TITLE_LENGTH } from '@/model/school/courses';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
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

// Types assigned to colors
const typeOptions: { type: MaterialType, color: Color }[] = [
    { type: 'slide', color: 'cherry' },
    { type: 'exercise', color: 'maroon' },
    { type: 'image', color: 'yellow' },
    { type: 'other', color: 'sapphire' },
    { type: 'feedback', color: 'lavender' },
];

// Valid formats for each material type
const validFormats: { [key in MaterialType]: string[] } = {
    slide: ['pdf'],
    exercise: ['pdf'],
    image: ['pdf', 'png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'],
    feedback: ['*'],
    other: ['*'],
};

type MaterialMode = 'add' | 'edit';

interface MaterialPropsBase {
    mode: MaterialMode;
    courseId: string;
}

type MaterialProps = MaterialPropsBase & (
    {
        mode: 'edit';
        onSubmit: (material: Material, materialID: MaterialID, deleteOnFirebase: (materialId: MaterialID) => Promise<void>) => Promise<void>;
        onDelete: (materialID: MaterialID) => Promise<void>;
        material: { id: string, data: Material };
    } | {
        mode: 'add';
        onSubmit: (material: Material, deleteOnFirebase: (materialId: MaterialID) => Promise<void>) => Promise<void>;
        onDelete?: never;
        material?: never;
    }
);


/**
 * MaterialComponent
 * 
 * This component is responsible for displaying the page to add or edit a material to the course.
 * 
 * @param onSubmit - The function to be called when the user submits the material.
 * @param mode - The mode of the component (add or edit).
 * @param courseId - The ID of the course.
 * @param onDelete - The function to be called when the user deletes the material.
 * @param material - The material to be edited.
 * 
 * 
 * @returns JSX.Element - The rendered component for the material creation inner-page.
 */
const MaterialComponent: ReactComponent<MaterialProps> = ({ mode, courseId, onSubmit, onDelete, material }) => {

    const [title, setTitle] = useState<string>(material?.data.title ?? "");
    const [description, setDescription] = useState<string>(material?.data.description ?? "");
    const [fromDate, setFromDate] = useState<Date>(material ? Time.toDate(material.data.from) : new Date());
    const [toDate, setToDate] = useState<Date>(material ? Time.toDate(material.data.to) : new Date());
    const [docs, setDocs] = useState<MaterialDocument[]>(material?.data.docs ?? []);
    const [docTitle, setDocTitle] = useState<string>('');
    const [docType, setDocType] = useState<MaterialType>('slide');
    const [docName, setDocName] = useState<string>('');
    const [docData, setDocData] = useState<string>('');
    const [documentsData, setDocumentsData] = useState<Array<{ uri: string, dataBase64: string }>>([]);
    const [docFormat, setDocFormat] = useState<string>('');
    const [deletedDocs, setDeletedDocs] = useState<MaterialDocument[]>([]);
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
    const [isDocumentButtonDisabled, setIsDocumentButtonDisabled] = useState(true);

    const resetDocument = () => {
        setDocTitle('');
        setDocType('slide');
        setDocName('');
        setDocTitleChanged(false);
        setDocData('');
    }

    //===============================================================
    //======================== Listeners ============================
    //===============================================================

    // Document Format Listener
    useEffect(() => {
        if (docName) {
            setDocFormat(docName.substring(docName.lastIndexOf('.') + 1).toLowerCase())
        } else {
            setDocFormat('');
        }
    }, [docName]);

    // Submit Button Validation Listener
    useEffect(() => {
        const isInvalid =
            mode === 'add'
            && (
                !fromDateChanged || !fromTimeChanged || !toDateChanged || !toTimeChanged ||
                (toDateChanged && fromDateChanged && toDate.getTime() < fromDate.getTime())
            )
            || title === "" || title.length > MAX_MATERIAL_TITLE_LENGTH || description.length > MAX_MATERIAL_DESCRIPTION_LENGTH;

        setIsButtonDisabled(isInvalid);
    }, [
        mode, fromDateChanged, fromTimeChanged, toDateChanged, toTimeChanged,
        title, description, fromDate, toDate,
        MAX_MATERIAL_TITLE_LENGTH, MAX_MATERIAL_DESCRIPTION_LENGTH
    ]);

    // Document Button Validation Listener
    useEffect(() => {
        if (docName) {
            const isValidFormat = validFormats[docType].includes(docFormat) || validFormats[docType].includes('*');
            setIsDocumentButtonDisabled(!isValidFormat || docTitle === "" || docTitle.length > MAX_DOCUMENT_TITLE_LENGTH || docName === "" || docFormat === "");
        } else {
            setIsDocumentButtonDisabled(true);
        }
    }, [docName, docType, docTitle, MAX_DOCUMENT_TITLE_LENGTH, docFormat]);



    //===============================================================
    //====================== onChange Callbacks =====================
    //===============================================================

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



    //===============================================================
    //======================== File Upload ==========================
    //===============================================================

    // Handle the file picker
    const handlePickFile = async () => {
        try {
            // Open the file picker
            console.log('Opening file picker...');
            const allowedTypes = {
                slide: 'application/pdf',
                exercise: 'application/pdf',
                image: ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/gif', 'image/webp'],
                feedback: '*/*',
                other: '*/*',
            };

            const result = await DocumentPicker.getDocumentAsync({
                copyToCacheDirectory: true,
                type: allowedTypes[docType],
                multiple: false,
            });

            if (result.canceled) {
                console.log('File selection cancelled.');
                return;
            }

            const { uri, name } = result.assets[0];
            console.log('Selected File :', name);

            // Read the file data
            const base64Data = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });

            console.log('Encoded File Data ready to be uploaded.');

            // Set the document data
            setDocName(name);
            setDocData(base64Data);
        } catch (error) {
            console.error('Erreur lors de la sélection ou de la lecture du fichier :', error);
        }
    };

    // Handle the document save when the user clicks on the save button
    const handleSaveDocument = async () => {
        const newDoc: MaterialDocument = {
            title: docTitle,
            uri: docName,
            type: docType,
        };
        setDocs([...docs, newDoc]);
        setDocumentsData([...documentsData, { uri: docName, dataBase64: docData }]);
        resetDocument();
    };

    // Handle the deleted documents and uploaded new ones to the server
    const handleUploadDocuments = async (materialId: MaterialID) => {
        if (materialId) {
            try {
                // Upload the documents to the server
                documentsData.forEach(async (docToUpload) => {
                    await uploadToFirebase(docToUpload.uri, docToUpload.dataBase64, `courses/${courseId}/materials/${materialId}`);
                });
                // Delete the deleted documents from the server
                deletedDocs.forEach(async (docToDelete) => {
                    deleteFromFirebase(`courses/${courseId}/materials/${materialId}`, docToDelete.uri);
                });
            } catch (error) {
                console.error('Error uploading document:', error);
            }
        }
    };

    // Handle the deletion of a document
    const handleOnDeleteDocument = (docToDelete: MaterialDocument) => {

        // Remove the document from the list
        setDocs(docs.filter(d => d !== docToDelete));
        setDocumentsData(documentsData.filter(d => d.uri !== docToDelete.uri));

        // If document already present in the firebase cloud storage, add it to the deleted docs
        if (material?.data.docs.includes(docToDelete)) {
            setDeletedDocs([...deletedDocs, docToDelete]);
        }
    };

    // Handle the submission of the material
    const handleOnSubmit = async () => {
        if (mode === 'edit') {
            // Submit on edit mode
            onSubmit(
                {
                    title: title,
                    description: description,
                    from: Time.fromDate(fromDate),
                    to: Time.fromDate(toDate),
                    docs: docs
                } as Material,
                material.id,
                handleUploadDocuments
            );
        } else {
            // Submit on add mode
            onSubmit(
                {
                    title: title,
                    description: description,
                    from: Time.fromDate(fromDate),
                    to: Time.fromDate(toDate),
                    docs: docs
                },
                handleUploadDocuments
            );
        }
    };

    // Handle the deletion of a material
    const handleDeleteMaterial = async () => {
        Alert.alert(
            t(`course:confirm_deletion`),
            t(`course:confirm_deletion_text`),
            [
                {
                    text: t(`course:cancel`),
                    style: 'cancel',
                },
                {
                    text: t(`course:delete`),
                    style: 'destructive',
                    onPress: async () => {
                        if (mode === 'edit') {
                            try {
                                await onDelete(material.id);
                                deleteDirectoryFromFirebase(`courses/${courseId}/materials/${material.id}`);
                            } catch (error) {
                                console.error('Error deleting material:', error);
                            }
                        } else {
                            console.error('Cannot delete a material that has not been created yet.');
                        }
                    },
                },
            ]
        );
    };




    return (
        <>
            <TScrollView testID={testIDs.scrollView} key={'scrollView'}>

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
                        onChangeText={(text) => { setTitleChanged(true); setTitle(text); }}
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



                {/* Documents View */}
                <TView testID={testIDs.documentsView} flexDirection='row' alignItems='center' justifyContent='space-between' mx='md'>
                    <TText
                        testID={testIDs.documentsTitle}
                        size={24} bold mb={20} pt={30}
                    >
                        {t('course:documents_title')}
                    </TText>

                    <TTouchableOpacity
                        onPress={() => { setShowAddDocument(!showAddDocument); resetDocument(); }}
                        radius={'xl'}
                        flexDirection='row'
                        alignItems='center'
                        p={5}
                        mt={10}
                        testID={testIDs.addDocumentButton}
                    >
                        <Icon
                            testID={testIDs.addDocumentIcon}
                            name={showAddDocument ? 'chevron-down' : 'chevron-forward'}
                            color='text'
                            size='lg'
                        />
                        <TText
                            testID={testIDs.addDocumentText}
                            bold
                            ml={5}
                        >
                            {t('course:add_document')}
                        </TText>
                    </TTouchableOpacity>
                </TView>



                {/* Add Document View */}
                {showAddDocument &&
                    <TView testID={testIDs.addDocumentView} pb={20}>
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
                            testID={testIDs.docTypeInput}
                            onPress={() => {
                                setDocType(typeOptions[(typeOptions.findIndex(option => option.type === docType) + 1) % typeOptions.length].type);
                            }}
                            backgroundColor={typeOptions[typeOptions.findIndex(option => option.type === docType)].color}
                            textColor='constantWhite'
                            mt={'md'} mb={'sm'}
                            radius={'lg'}
                        >
                            {docType}
                        </FancyButton>
                        <TView testID={testIDs.browseView} flexDirection='row' justifyContent='flex-start' alignItems='center' mt='md' mx='md' pb={20}>
                            <TTouchableOpacity
                                testID={testIDs.browseTouchableOpacity}
                                onPress={handlePickFile}
                                radius={'md'}
                                backgroundColor='crust'
                                flexDirection='row'
                                alignItems='center'
                                p={8}
                                px={15}
                            >
                                <Icon
                                    testID={testIDs.browseIcon}
                                    name='document-attach-outline'
                                    color='subtext0'
                                    size='lg'
                                />
                                <TText
                                    testID={testIDs.browseText}
                                    color='text'
                                    ml={10}
                                >
                                    {t('course:browse_document')}
                                </TText>
                            </TTouchableOpacity>
                            <TText
                                testID={testIDs.fileName}
                                ml={10}
                                mr='md'
                                numberOfLines={1}
                                color='subtext0'
                            >
                                {docName.length > 20 ? docName.substring(0, 20) + '...' : docName}
                            </TText>
                        </TView>

                        <FancyButton
                            testID={testIDs.saveUploadButton}
                            onPress={handleSaveDocument}
                            disabled={isDocumentButtonDisabled}
                            backgroundColor={isDocumentButtonDisabled ? 'subtext0' : 'blue'}
                            textColor='constantWhite'
                            mt={'md'} mb={'sm'}
                            radius={'xl'}
                        >
                            {t('course:save_upload')}
                        </FancyButton>
                    </TView>
                }



                {/* Documents Display */}
                <TView
                    testID={testIDs.documentsDisplay}
                    pb={60}
                    mx={20}
                >
                    <For
                        each={docs.length > 0 ? docs.reverse() : undefined}
                        fallback={<TText size={16} testID={testIDs.noAssignmentDue}>{t('course:no_documents')}</TText>}
                    >{(doc) => (
                        <DocumentDisplay
                            doc={doc}
                            isTeacher
                            onDelete={handleOnDeleteDocument}
                        />
                    )}
                    </For>

                </TView>

            </TScrollView >



            {/* Submit and Delete Buttons */}
            <TView
                testID={testIDs.finishViews}
                key={'finishButtons'}
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                backgroundColor='transparent'
                bt={1} borderColor='surface0'
                mb={40} pt={20}
            >
                <TTouchableOpacity
                    testID={testIDs.submitTouchableOpacity}
                    backgroundColor={isButtonDisabled ? 'text' : 'blue'}
                    disabled={isButtonDisabled}
                    onPress={handleOnSubmit}
                    flex={1} mx={10} p={12}
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

                {mode == 'edit' &&
                    <TTouchableOpacity
                        testID={testIDs.deleteTouchableOpacity}
                        backgroundColor="red"
                        onPress={handleDeleteMaterial}
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
