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
import { router } from 'expo-router';
import { useState } from 'react';
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
            </TScrollView>

            <TTouchableOpacity backgroundColor={(isInvalid) ? 'text' : 'blue'} disabled={isInvalid} onPress={saveAction} mt='xl' ml='xl' mr='xl' p={12} radius={'xl'}
                style={{ position: 'absolute', bottom: 15, left: 0, right: 0, zIndex: 100, borderRadius: 9999 }}>
                <TView flexDirection='row' justifyContent='center' alignItems='center'>
                    <Icon name="save" color='base' size={'md'} />
                    <TText color='base' ml={10}>{t(`todo:save_button`)}</TText>
                </TView>
            </TTouchableOpacity >

        </>
    );
};

export default createTodo;

