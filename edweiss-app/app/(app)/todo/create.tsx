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
import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { Time } from '@/utils/time';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { useState } from 'react';
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;


const CreateTodoScreen: ApplicationRoute = () => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TodoStatus>("yet");
    const [date, setDate] = useState(new Date());
    const [showPickerDate, setShowPickerDate] = useState(false);
    const [showPickerTime, setShowPickerTime] = useState(false);


    // Toogle the save button only when valid
    const isInvalid = name === "" || !date;

    const onChangeDate = (event: any, selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate);
            setShowPickerDate(false);
            setShowPickerTime(false);
            console.log(`Date changed to ${date}`);
        }
    };



    async function saveAction() {
        const res = await callFunction(Functions.createTodo, {
            todo: { name, description: (description == "") ? undefined : description, status, dueDate: Time.fromDate(date) }
        }
        );

        if (res.status) {
            // Toast
            console.log("Succefully todo added");
            router.push("/(app)/todo" as any);
        } else {
            console.log(res.error);
        }


    }

    return (
        <>
            <RouteHeader title={t(`todo:create_header`)} />

            <TScrollView>

                <TView>
                    <FancyTextInput
                        value={name}
                        onChangeText={n => setName(n)}
                        placeholder={t(`todo:name_placeholder`)}
                        icon='people'
                        label='Name'
                    />
                    <FancyTextInput
                        value={description}
                        onChangeText={n => setDescription(n)}
                        placeholder={t(`todo:description_placeholder`)}
                        icon='list'
                        label='Description'
                        multiline
                        numberOfLines={4}
                        mt={'sm'}
                    />
                </TView>

                <TView>

                    <FancyButton icon='calendar' onPress={() => setShowPickerDate(true)}>
                        Show date picker
                    </FancyButton>

                    <FancyButton icon='alarm' onPress={() => setShowPickerTime(true)}>
                        Show time picker
                    </FancyButton>

                    {showPickerDate && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode='date'
                            is24Hour={true}
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}

                    {showPickerTime && (
                        <DateTimePicker
                            testID="dateTimePicker"
                            value={date}
                            mode='time'
                            is24Hour={true}
                            display="default"
                            onChange={onChangeDate}
                        />
                    )}



                </TView>
            </TScrollView>

            <TTouchableOpacity backgroundColor={(isInvalid) ? 'text' : 'blue'} disabled={isInvalid} onPress={saveAction} ml={100} mr={100} p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 15, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
                <TView flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon name="save" color='base' size={'md'} />
                    <TText color='base' ml={10}>{t(`todo:save_button`)}</TText>
                </TView>
            </TTouchableOpacity >

        </>
    );
};

export default CreateTodoScreen;

