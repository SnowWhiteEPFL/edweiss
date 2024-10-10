import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import Todolist from '@/model/todo';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { sameTodos, StatusChanger } from '.';
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
    const isValid: boolean = sameTodos(todo, newTodo);

    async function editTodoAction() {
        const res = await callFunction(Functions.updateTodo, { id, newTodo });

        if (res.status) {
            // Toast
            console.log("Succefully todo modified the todo");
            router.push("/(app)/todo");
        } else {
            console.log(res.error);
        }


    }

    return (
        <>
            <RouteHeader title={t(`todo:edit_header`)} />

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

                <StatusChanger status={status} setStatus={setStatus}></StatusChanger>

            </TScrollView>

            <TTouchableOpacity backgroundColor={(isValid) ? 'text' : 'blue'} disabled={isValid} onPress={editTodoAction} ml='xl' mr='xl' p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 15, left: 0, right: 0, zIndex: 100 }}>
                <TView flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon name="create" color='base' size={'md'} />
                    <TText color='base' ml={10}>{t(`todo:edit_button`)}</TText>
                </TView>
            </TTouchableOpacity >

        </>
    );
};

export default editTodo;

