import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { TextInput } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { StatusChanger } from '.';
import TodoStatus = Todolist.TodoStatus;
import Todo = Todolist.Todo;
import Functions = Todolist.Functions;


const editTodo: ApplicationRoute = () => {
    const { idString, todoJSON } = useLocalSearchParams();
    const id = idString as string;
    const todo = JSON.parse(todoJSON as string) as Todo;

    const [name, setName] = useState(todo.name);
    const [description, setDescription] = useState(todo.description || "");
    const [status, setStatus] = useState<TodoStatus>(todo.status);
    const newTodo: Todo = { name, description: (description == "") ? undefined : description, status };
    const isInvalid = name == "";

    async function editTodoAction() {
        const res = await callFunction(Functions.updateTodo, { id, newTodo });

        if (res.status) {
            // Toast
            console.log("Succefully todo modified the todo");
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
                <StatusChanger status={status} setStatus={setStatus}></StatusChanger>
                <FancyButton backgroundColor={(isInvalid) ? 'text' : 'blue'} disabled={isInvalid} onPress={editTodoAction} mt='xl' ml='xl' mr='xl'>Save</FancyButton>
            </TView>

        </>
    );
};

export default editTodo;

