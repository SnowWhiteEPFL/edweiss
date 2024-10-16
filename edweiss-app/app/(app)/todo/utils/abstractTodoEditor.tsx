/**
 * @file abstractTodoEditor.tsx
 * @description Module for editing todo items in the edweiss app
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
import { StatusChanger } from './todoDisplay';
import { sameTodos } from './utilsFunctions';
import Functions = Todolist.Functions;

// Types
type TodoStatus = Todolist.TodoStatus;


// ------------------------------------------------------------
// --------------  The Custumisable Todo Editor   -------------
// ------------------------------------------------------------

export const AbstractTodoEditor: React.FC<{
    editable?: boolean;
    todo?: Todolist.Todo;
    id?: string;

} & LightDarkProps
> = ({ editable = false, todo, id }) => {

    const providedDate = editable && todo && todo.dueDate;

    // Use states
    const [name, setName] = useState(editable ? todo!.name : "");
    const [status, setStatus] = useState<TodoStatus>(editable ? todo!.status : "yet");
    const [description, setDescription] = useState(editable ? todo!.description : "");
    const [date, setDate] = useState((providedDate) ? Time.toDate(todo.dueDate!) : new Date());
    const [dateChanged, setDateChanged] = useState(false);
    const [timeChanged, setTimeChanged] = useState(false);
    const [showPickerDate, setShowPickerDate] = useState(false);
    const [showPickerTime, setShowPickerTime] = useState(false);

    // Constants    
    const downButtonTitle = (editable) ? t(`todo:edit_button`) : t(`todo:save_button`);
    const downButtonIconName = (editable) ? "create" : "save";
    const screenTitle = (editable) ? t(`todo:edit_header`) : t(`todo:create_header`);
    const downButtonAction = (editable) ? editTodoAction : saveAction;


    // Toogle the save button only when valid
    const modifiedTodo = !(editable && todo) ? undefined :
        {
            name: name, description: description === "" ? undefined : description, status: status,
            dueDate: (!providedDate && !(dateChanged || timeChanged)) ? undefined : date
        };
    const isInvalid = (editable) ? sameTodos(todo!, modifiedTodo!) : name === "";


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
                // Toast
                console.log("Successfully todo added");
                router.back();
            } else {
                console.log(res.error);
            }
        } catch (error) {
            console.error("Error creating todo:", error);
        }
    }


    async function editTodoAction() {
        if (!id) return;


        if (editable) {
            const res = await callFunction(Functions.updateTodo, {
                name: name, description: description === "" ? undefined : description, status: status,
                dueDate: (!(dateChanged || timeChanged)) ? undefined : date.toISOString(),
                id: id
            }
            );


            if (res.status) {
                // Toast
                console.log("Successfully modified the todo");
                router.back();
            } else {
                console.log(res.error);
            }
        } else {
            console.log("Error: newTodo is undefined");
        }
    }

    async function deleteTodoAction() {
        if (!id) {
            console.log("Error: id is undefined");
            return;
        }
        const res = await callFunction(Functions.deleteTodo, { id });

        if (res.status) {
            // Toast
            console.log("Successfully deleted the todo");
            router.back();
        } else {
            console.log(res.error);
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
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>

                            <Icon name='calendar' size='md' color='overlay0' />
                            <TText ml={14} color={dateChanged || providedDate ? 'text' : 'overlay0'}>{date.toDateString()}</TText>
                        </TTouchableOpacity>
                    </TView>


                    <TView backgroundColor='crust' borderColor='surface0' radius={14} flex={1} flexDirection='column' ml='sm'>

                        <TText ml={16} mb={4} size={'sm'} pl={2} pt={'sm'} color='overlay2'>{t(`todo:time_btn_title`)}</TText>

                        <TTouchableOpacity onPress={() => setShowPickerTime(true)}

                            pr={'sm'} pl={'md'} pb={'sm'}
                            flexDirection='row' justifyContent='flex-start' alignItems='center'>

                            <Icon name='alarm' size='md' color='overlay0' />
                            <TText ml={10} color={timeChanged || providedDate ? 'text' : 'overlay0'}>{date.toTimeString().split(':').slice(0, 2).join(':')}</TText>
                        </TTouchableOpacity>
                    </TView>

                </TView>


                {showPickerDate && (
                    <DateTimePicker
                        testID="dateTimePicker"
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
                        testID="dateTimePicker"
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


