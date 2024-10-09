import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import Colors from '@/constants/Colors';
import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { router } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native';
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;


const createTodo: ApplicationRoute = () => {

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TodoStatus>("yet");
    const isInvalid = name == "";

    async function saveAction() {
        const res = await callFunction(Functions.createTodo, {
            todo: { name, description: (description == "") ? undefined : description, status }
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

            <TView>
                <TextInput value={name} onChangeText={n => setName(n)} placeholder='Name' placeholderTextColor={'#555'} style={{ borderWidth: 1, borderColor: Colors.dark.overlay0, padding: 8, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'text', borderRadius: 14, fontFamily: "Inter" }}></TextInput>
                <TextInput value={description} onChangeText={n => setDescription(n)} placeholder='Description' placeholderTextColor={'#555'} style={{ borderWidth: 1, borderColor: Colors.dark.overlay0, padding: 8, paddingVertical: 64, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'text', borderRadius: 14, fontFamily: "Inter" }}></TextInput>
                <FancyButton backgroundColor={(isInvalid) ? 'text' : 'blue'} disabled={isInvalid} onPress={saveAction} mt='xl' ml='xl' mr='xl'>Save</FancyButton>
            </TView>

        </>
    );
};

export default createTodo;

