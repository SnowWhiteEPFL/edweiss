/**
 * @file abstractTodoEditor.tsx
 * @description Module for editing to do items in the edweiss app
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { LightDarkProps } from '@/constants/Colors';
import Todolist from '@/model/todo';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { StatusChanger } from './todoDisplay';
import Functions = Todolist.Functions;

// Types
type TodoStatus = Todolist.TodoStatus;


// ------------------------------------------------------------
// --------------  The Custumisable To do Editor   ------------
// ------------------------------------------------------------

export const AbstractTodoEditor: React.FC<{
    editable?: boolean;
    todo?: Todolist.Todo;
    id?: string;

} & LightDarkProps
> = ({ editable = false, todo, id }) => {

    const providedDate = editable && todo?.dueDate;

    // Use states
    const [name, setName] = useState(editable ? todo!.name : "");
    const [status, setStatus] = useState<TodoStatus>(editable ? todo!.status : "yet");
    const [description, setDescription] = useState(editable ? todo!.description : "");
    const [date, setDate] = useState((providedDate) ? Time.toDate(todo.dueDate!) : new Date());
    const [dateChanged, setDateChanged] = useState(false);
    const [timeChanged, setTimeChanged] = useState(false);
    const [showPickerDate, setShowPickerDate] = useState(false);
    const [showPickerTime, setShowPickerTime] = useState(false);

    // Toogle the save button only when valid
    const isInvalid = name === "";

    // Constants for save state
    let downButtonIconName: "create" | "save" = "save";
    let downButtonTitle = t(`todo:save_button`);
    let screenTitle = t(`todo:create_header`);
    let downButtonAction = saveAction;

    if (editable) {
        downButtonIconName = "create";
        downButtonTitle = t(`todo:edit_button`);
        screenTitle = t(`todo:edit_header`);
        downButtonAction = editTodoAction;
    }



    // On change date and time update event handlers
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

    // Save, Edit and Delete Actions

    async function saveAction() {
        try {


            const res = await callFunction(Functions.createTodo, {
                name, description: (description != "") ? description : undefined,
                status, dueDate: (dateChanged || timeChanged) ? date.toISOString() : undefined
            });

            if (res.status) {
                router.back();
                Toast.show({
                    type: 'success',
                    text1: name + t(`todo:was_added_toast`),
                    text2: t(`todo:funny_phrase_on_add`)
                });
            } else if (res.error === "duplicate_todo") {
                Toast.show({
                    type: 'info',
                    text1: t(`todo:already_existing_todo_toast_title`),
                    text2: t(`todo:already_existing_todo_toast_funny`)
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: t(`todo:error_toast_title`),
                    text2: t(`todo:couldnot_save_toast`)
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: t(`todo:error_toast_title`),
                text2: t(`todo:couldnot_save_toast`)
            });
        }
    }


    async function editTodoAction() {
        if (!id) return;


        try {
            const res = await callFunction(Functions.updateTodo, {
                name: name, description: description === "" ? undefined : description, status: status,
                dueDate: (!(dateChanged || timeChanged)) ? undefined : date.toISOString(),
                id: id
            }
            );


            if (res.status) {
                router.back();
                Toast.show({
                    type: 'success',
                    text1: name + t(`todo:was_edited_toast`),
                    text2: t(`todo:funny_phrase_on_edit`)
                });
            } else if (res.error === "duplicate_todo") {
                Toast.show({
                    type: 'info',
                    text1: t(`todo:already_existing_todo_toast_title`),
                    text2: t(`todo:already_existing_todo_toast_funny`)
                });
            } else {
                Toast.show({
                    type: 'error',
                    text1: t(`todo:error_toast_title`),
                    text2: t(`todo:couldnot_edit_toast`)
                });
            }
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: t(`todo:error_toast_title`),
                text2: t(`todo:couldnot_edit_toast`)
            });
        }
    }

    async function deleteTodoAction() {
        if (!id) return;

        const res = await callFunction(Functions.deleteTodo, { id });

        if (res.status) {
            router.back();
            Toast.show({
                type: 'success',
                text1: name + t(`todo:was_deleted_toast`),
                text2: t(`todo:funny_phrase_on_delete`)
            });
        } else {
            Toast.show({
                type: 'error',
                text1: t(`todo:error_toast_title`),
                text2: t(`todo:couldnot_delete_toast`)
            });
        }
    }


    return (
        <>
            <RouteHeader title={screenTitle} />


            <TScrollView>

                <TView>
                    <FancyTextInput
                        value={name}
                        onChangeText={n => setName(n)}
                        placeholder={t(`todo:name_placeholder`)}
                        icon='people'
                        label={t(`todo:name_label`)}
                    />
                    <FancyTextInput
                        value={description}
                        onChangeText={n => setDescription(n)}
                        placeholder={t(`todo:description_placeholder`)}
                        icon='list'
                        label={t(`todo:description_label`)}
                        multiline
                        numberOfLines={4}
                        mt={'md'}
                        mb={'sm'}
                    />
                </TView>


                <TView flexDirection='row' justifyContent='space-between' alignItems='center' mr={'md'} ml={'md'} mt={'sm'} mb={'sm'}>


                    <TView backgroundColor='crust' borderColor='surface0' radius={14} flex={2} flexDirection='column' mr='sm'>

                        <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`todo:date_btn_title`)}</TText>

                        <TTouchableOpacity onPress={() => setShowPickerDate(true)}

                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center' testID='date-button'>

                            <Icon name='calendar' size='md' color='overlay0' />
                            <TText ml={14} color={dateChanged || providedDate ? 'text' : 'overlay0'} testID='date-holder'>{date.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>


                    <TView backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>

                        <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`todo:time_btn_title`)}</TText>

                        <TTouchableOpacity onPress={() => setShowPickerTime(true)}

                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center' testID='time-button'>

                            <Icon name='alarm' size='md' color='overlay0' />
                            <TText ml={10} color={timeChanged || providedDate ? 'text' : 'overlay0'} testID='time-holder'>{date.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>

                </TView>


                {showPickerDate && (
                    <DateTimePicker
                        testID="dateTimePicker1"
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
                        testID="dateTimePicker2"
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

                {editable && (
                    <TView>
                        <StatusChanger status={status} setStatus={setStatus}></StatusChanger>

                        <FancyButton icon='trash' textColor='red' backgroundColor='red' activeOpacity={0.2} outlined onPress={deleteTodoAction}>
                            {t(`todo:delete_btn_title`)}
                        </FancyButton>

                    </TView>
                )
                }

            </TScrollView >


            <TTouchableOpacity backgroundColor={(isInvalid) ? 'text' : 'blue'} disabled={isInvalid} onPress={downButtonAction} ml={100} mr={100} p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 15, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
                <TView flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon name={downButtonIconName} color='base' size={'md'} />
                    <TText color='base' ml={10}>{downButtonTitle}</TText>
                </TView>
            </TTouchableOpacity >

        </>
    );
};