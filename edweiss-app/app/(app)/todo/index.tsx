import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { IconType } from '@/constants/Style';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { default as Todolist } from '@/model/todo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { router } from 'expo-router';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import Todo = Todolist.Todo;
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;


const MAX_CHAR_PER_LINE = 30;

// ------------------------------------------------------------
// ----------------------- TodoScreen -------------------------
// ------------------------------------------------------------

const TodoScreen: ReactComponent<{}> = (props) => {
    const auth = useAuth();
    const todosData = useDynamicDocs(CollectionOf<Todo>(`users/${auth.authUser.uid}/todos_aas`));
    const todos = todosData ? todosData.map(doc => ({ id: doc.id, data: doc.data })) : [];
    const [todoToDisplay, setTodoToDisplay] = React.useState<Todo>();
    const modalRef = useRef<BottomSheetModal>(null);


    return (
        <>
            <RouteHeader title={t(`todo:todolist_header`)} />

            <TScrollView>
                <For each={todos}>
                    {todo => <TodoDisplay key={todo.id} id={todo.id} todo={todo.data} setTodoToDisplay={setTodoToDisplay} modalRef={modalRef} />}
                </For>
                <TView mt={50} mb={75}></TView>
            </TScrollView>

            <TTouchableOpacity onPress={() => router.push('/(app)/todo/create' as any)} p='xs' m='md' mt={'sm'} mb={'sm'} radius={'lg'} backgroundColor='base' b={'sm'} borderColor='overlay0' style={{ position: 'absolute', bottom: 30, right: 10, zIndex: 100 }}>
                <Icon name="duplicate" color='blue' size={50}></Icon>
            </TTouchableOpacity >


            <TodoModalDisplay modalRef={modalRef} todo={todoToDisplay} onClose={() => { setTodoToDisplay(undefined); modalRef.current?.close(); }} />


        </>
    );
};

export default TodoScreen;



// ------------------------------------------------------------
// ----------------------- TodoDisplay ------------------------
// ------------------------------------------------------------


const TodoDisplay: ReactComponent<{ key: string, id: string, todo: Todo; setTodoToDisplay: React.Dispatch<React.SetStateAction<Todo | undefined>>; modalRef: React.RefObject<BottomSheetModalMethods>; }> = ({ id, todo, setTodoToDisplay, modalRef }) => {

    return (
        <>
            <TTouchableOpacity
                b={'lg'}
                m='md'
                mt={'sm'}
                mb={'sm'}
                p='lg'
                backgroundColor='base'
                borderColor='surface0'
                radius='lg'
            >
                <TView flexDirection='row' justifyContent='space-between'>
                    <TView flex={1} mr='md'>
                        <TTouchableOpacity
                            onPress={() => { setTodoToDisplay(todo); modalRef.current?.present(); }}
                            onLongPress={() => { console.log('Long Pressed'); router.push({ pathname: "/(app)/todo/edit", params: { idString: id, todoJSON: JSON.stringify(todo) } }); }}>

                            <TText color='text' bold numberOfLines={1} ellipsizeMode='tail'>
                                {todo.name}
                            </TText>
                            {
                                todo.description &&
                                <TText color='subtext0' size={'sm'} bold numberOfLines={1} ellipsizeMode='tail'>
                                    {todo.description}
                                </TText>
                            }
                            <TText size='xs' color={statusColorMap[todo.status]} bold numberOfLines={1} ellipsizeMode='tail'>
                                {t(`todo:status.${todo.status}`)}
                            </TText>

                        </TTouchableOpacity>
                    </TView>

                    <TodoStatusDisplay id={id} todo={todo} status={todo.status}></TodoStatusDisplay>

                </TView>
            </TTouchableOpacity >

        </>
    );
};


// ------------------------------------------------------------
// -----------------------    Utils    ------------------------
// ------------------------------------------------------------

const TodoStatusDisplay: ReactComponent<{ id: string, todo: Todo, status: TodoStatus; }> = ({ id, todo, status }) => {

    return <>
        <TTouchableOpacity activeOpacity={0.2} onPress={() => { statusNextAction(id, todo); }} backgroundColor={'transparent'} borderColor='overlay0' b={'md'} radius={'xl'} pl={'md'} pr={'md'} pt={'md'} pb={'md'}>
            <Icon name={statusIconMap[status]} color={statusColorMap[status]} size={'xl'}></Icon>
        </TTouchableOpacity >
    </>;
};

export const StatusChanger: ReactComponent<{ status: TodoStatus, setStatus: Dispatch<SetStateAction<TodoStatus>>; }> = ({ status, setStatus }) => {
    return <>
        <FancyButton onPress={() => setStatus(statusNextMap[status])} icon={statusIconMap[status]} m={'xl'} backgroundColor={'text'} outlined>
            {t(`todo:status.${status}`)}
        </FancyButton>

    </>;
};



const TodoModalDisplay: ReactComponent<{ modalRef: React.RefObject<BottomSheetModalMethods>; todo?: Todo; onClose: () => void; }> = ({ modalRef, todo, onClose }) => {


    return (

        <ModalContainer modalRef={modalRef}>
            {todo && <>

                <TView justifyContent='center' alignItems='center' mb='sm'>
                    <TText bold size='lg' mb='sm'>{todo.name}</TText>
                </TView>


                <TView justifyContent='center' alignItems='baseline' mb='md' ml='lg'>
                    {todo.description && (
                        <TView>
                            {todo.description.split('\n').map((line, index) => (
                                <TText key={index} color='subtext0' size='md' mb='sm'>
                                    {`• ${line}`}
                                </TText>
                            ))}
                        </TView>
                    )}
                </TView>

                <TView mb='lg' pl={'md'} pr={'md'} flexDirection='row' alignItems='center'>
                    <Icon name={statusIconMap[todo.status]} color={statusColorMap[todo.status]} size={'xl'} />
                    <TText size='sm' color={statusColorMap[todo.status]} ml='md'>
                        {t(`todo:status.${todo.status}`)}
                    </TText>
                </TView>

                <TView mb={20}></TView>

                <FancyButton backgroundColor='base' textColor='text' mb='md' onPress={() => onClose()}>
                    Close
                </FancyButton>
            </>
            }
        </ModalContainer>
    );
};




export const statusIconMap: Record<TodoStatus, IconType> = {
    yet: "alert-circle",
    in_progress: "construct",
    done: "checkmark-done-circle"
};

export const statusColorMap: Record<TodoStatus, Color> = {
    yet: "red",
    in_progress: "yellow",
    done: "green"
};

export const statusNextMap: Record<TodoStatus, TodoStatus> = {
    yet: 'in_progress',
    in_progress: 'done',
    done: 'yet'
};

const statusNextAction = async (id: string, todo: Todo) => {
    const newTodo = {
        ...todo,
        status: statusNextMap[todo.status]
    };
    try {

        const res = await callFunction(Functions.updateTodo, { id, newTodo });

        if (res.status) {
            console.log('Todo updated successfully');
        } else {
            console.error('Failed to update todo:', res.error);
        }
    } catch (error) {
        console.error('Error updating todo:', error);
    }
};

export const sameTodos = (todo1: Todo, todo2: Todo): boolean => {
    return todo1.name === todo2.name && todo1.description === todo2.description && todo1.status === todo2.status;
};;