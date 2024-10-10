import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import ModalContainer from '@/components/core/modal/ModalContainer';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, CollectionOf } from '@/config/firebase';
import t from '@/config/i18config';
import { Color, LightDarkProps } from '@/constants/Colors';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { IconType } from '@/constants/Style';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import useThemeColor from '@/hooks/theme/useThemeColor';
import { default as Todolist } from '@/model/todo';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { router, useRouter } from 'expo-router';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { GestureHandlerRootView, NativeViewGestureHandler, PanGestureHandler, ScrollView, State } from 'react-native-gesture-handler';

import Todo = Todolist.Todo;
import TodoStatus = Todolist.TodoStatus;
import Functions = Todolist.Functions;


// ------------------------------------------------------------
// ----------------------- TodoScreen -------------------------
// ------------------------------------------------------------

const TodoListScreen: ApplicationRoute = () => {
    const auth = useAuth();
    const todosData = useDynamicDocs(CollectionOf<Todo>(`users/${auth.authUser.uid}/todos_aas`));
    const todos = todosData ? todosData.map(doc => ({ id: doc.id, data: doc.data })) : [];
    const [todoToDisplay, setTodoToDisplay] = React.useState<Todo>();
    const modalRef = useRef<BottomSheetModal>(null);


    return (
        <>
            <RouteHeader title={t(`todo:todolist_header`)} />
            <GestureHandlerRootView style={{ flex: 1 }}>
                <NativeViewGestureHandler>
                    <ScrollView>
                        {todos.map((todo) => (
                            <TodoDisplay
                                key={todo.id}
                                id={todo.id}
                                todo={todo.data}
                                setTodoToDisplay={setTodoToDisplay}
                                modalRef={modalRef}
                            />
                        ))}
                        <TView mt={50} mb={75}></TView>
                    </ScrollView>
                </NativeViewGestureHandler>
            </GestureHandlerRootView>


            <TTouchableOpacity onPress={() => router.push('/(app)/todo/create' as any)} p={6} m='md' mt={'sm'} mb={'sm'} radius={'lg'} backgroundColor='base' b={'sm'} borderColor='overlay0' style={{ position: 'absolute', bottom: 30, right: 10, zIndex: 100 }}>
                <Icon name="duplicate" color='blue' size={50}></Icon>
            </TTouchableOpacity >


            <TodoModalDisplay modalRef={modalRef} todo={todoToDisplay} onClose={() => { setTodoToDisplay(undefined); modalRef.current?.close(); }} />


        </>
    );
};

export default TodoListScreen;



// ------------------------------------------------------------
// ----------------------- TodoDisplay ------------------------
// ------------------------------------------------------------

const TodoDisplay: React.FC<{ key: string, id: string, todo: Todo; setTodoToDisplay: React.Dispatch<React.SetStateAction<Todo | undefined>>; modalRef: React.RefObject<BottomSheetModalMethods>; } & LightDarkProps> = ({ id, light, dark, todo, setTodoToDisplay, modalRef }) => {

    // Screen Properties
    const screenWidth = Dimensions.get('window').width;
    const router = useRouter();
    const threshold = screenWidth / 2.5;                            // Threshold for swipe gesture
    const edgeZoneWidth = screenWidth / 10;                         // Width of the edge zone where the swipe gesture starts
    const bgColor = useThemeColor({ light, dark }, 'crust');        // Background color of the todo card

    // Animation Listeners            
    const translateX = useRef(new Animated.Value(0)).current;       // Animated value for horizontal movement
    const gestureStartX = useRef(0);                                // Stores where the gesture starts
    const gestureStartY = useRef(0);                                // Stores the vertical position where the gesture starts
    const isEdgeSwipe = useRef(false);                              // Determines if the swipe started at the edges


    // Gesture Handlers throw X axis
    const handlePanGestureEvent = Animated.event(
        [{ nativeEvent: { translationX: translateX } }],
        { useNativeDriver: true }
    );

    /**
     * Handle the end of the gesture to snap back 
     * or navigate to the edit screen (fix me)
     */
    const handleGestureEnd = (event: any) => {
        const { translationX } = event.nativeEvent;

        // Threshold activated then archive the todo
        if (Math.abs(translationX) > threshold) {
            Animated.timing(translateX, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true
            }).start(() => { toogleArchivityOfTodo(id, todo); });

        }

        // Snap back to original position
        else {
            Animated.spring(translateX, {
                toValue: 0,
                useNativeDriver: true
            }).start();
        }
    };

    /**
     * Handle the gesture state change
     * Note: this function manages the distinction between a
     *  vertical/horizontal scroll
     */
    const onHandlerStateChange = (event: any) => {
        const { state, translationY, translationX } = event.nativeEvent;

        // Note: Record the starting position of the gesture
        if (state === State.BEGAN) {
            gestureStartX.current = event.nativeEvent.x;
            gestureStartY.current = event.nativeEvent.y;
            isEdgeSwipe.current = (gestureStartX.current <= edgeZoneWidth || gestureStartX.current >= screenWidth - edgeZoneWidth);
        }

        /* Note: Check if the user started the gesture near the 
         * edges and privilledge the vertical scroll            */
        if (state === State.ACTIVE) {
            if (isEdgeSwipe.current) {
                if (Math.abs(translationY) > Math.abs(translationX)) {
                    return;
                }
                translateX.setValue(translationX);
            }
        }

        // Note: Handle snapping back or going to the edit screen
        if (state === State.END) {
            handleGestureEnd(event);
        }
    };



    return (

        <>
            <TView >

                {/* Background Archive Text */}
                <BackgroundArchiveText todo={todo} />


                {/* Front Card Display */}
                <PanGestureHandler
                    onGestureEvent={handlePanGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >


                    {/* The Animated TODO Card */}
                    <Animated.View
                        style={{
                            transform: [{ translateX }],
                            borderRadius: 20,
                            backgroundColor: bgColor,
                            margin: 13,
                            overflow: 'hidden',
                            zIndex: 100
                        }}
                    >
                        <TTouchableOpacity
                            b={'lg'}
                            m='sm'
                            p='lg'
                            backgroundColor='base'
                            borderColor='surface0'
                            radius='lg'
                        >
                            <TView flexDirection='row' justifyContent='space-between'>
                                <TView flex={1} mr='md'>
                                    <TTouchableOpacity
                                        // Display the modal on simple press

                                        onPress={() => { setTodoToDisplay(todo); modalRef.current?.present(); }}

                                        // Navigate to edit screen on long press
                                        onLongPress={() => { router.push({ pathname: "/(app)/todo/edit", params: { idString: id, todoJSON: JSON.stringify(todo) } }); }}
                                    >

                                        <TText color='text' bold numberOfLines={1} ellipsizeMode='tail'>
                                            {todo.name}
                                        </TText>

                                        {todo.description && (
                                            <TText color='subtext0' size={'sm'} bold numberOfLines={1} ellipsizeMode='tail'>
                                                {todo.description}
                                            </TText>
                                        )}

                                        <TText size='xs' color={statusColorMap[todo.status]} bold numberOfLines={1} ellipsizeMode='tail'>
                                            {t(`todo:status.${todo.status}`)}
                                        </TText>


                                    </TTouchableOpacity>
                                </TView>

                                <TodoStatusDisplay id={id} todo={todo} status={todo.status}></TodoStatusDisplay>


                            </TView>
                        </TTouchableOpacity>
                    </Animated.View>
                </PanGestureHandler >
            </TView>
        </>
    );
};


// ------------------------------------------------------------
// -----------------------    Utils    ------------------------
// ------------------------------------------------------------

const BackgroundArchiveText: React.FC<{ todo: Todo; }> = ({ todo }) => {

    const bg_text = todo.status === "archived" ? t(`todo:archive_bg_when_archived`) : t(`todo:archive_bg_when_active`);

    return (
        <TView
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 10,
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: 'row',
                backgroundColor: 'transparent',
                paddingHorizontal: 20
            }}
        >
            <TText></TText>
            <Icon name="archive" color='text' size='lg' />
            <TText color='text' ml="sm" mr="sm">
                {bg_text}
            </TText>
            <Icon name="archive" color='text' size='lg' />
            <TText></TText>
        </TView>
    );
};



const TodoStatusDisplay: ReactComponent<{ id: string, todo: Todo, status: TodoStatus; }> = ({ id, todo, status }) => {

    return <>
        <TTouchableOpacity activeOpacity={0.2} onPress={() => { statusNextAction(id, todo); }} backgroundColor={'transparent'} borderColor='overlay0' b={'md'} radius={'xl'} pl={'md'} pr={'md'} pt={'md'} pb={'md'}>
            <Icon name={statusIconMap[status]} color={statusColorMap[status]} size={'xl'}></Icon>
        </TTouchableOpacity >
    </>;
};

export const StatusChanger: ReactComponent<{ status: TodoStatus, setStatus: Dispatch<SetStateAction<TodoStatus>>; }> = ({ status, setStatus }) => {
    return <>
        <FancyButton onPress={() => setStatus(statusNextMap[status])} icon={statusIconMap[status]} m={'md'} backgroundColor={'text'} outlined>
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

                <FancyButton backgroundColor='subtext0' mb='md' onPress={() => onClose()} outlined>
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
    done: "checkmark-done-circle",
    archived: "archive"
};

export const statusColorMap: Record<TodoStatus, Color> = {
    yet: "red",
    in_progress: "yellow",
    done: "green",
    archived: "overlay0"

};

export const statusNextMap: Record<TodoStatus, TodoStatus> = {
    yet: 'in_progress',
    in_progress: 'done',
    done: 'yet',
    archived: 'archived'
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

const toogleArchivityOfTodo = async (id: string, todo: Todo) => {
    const newTodo = {
        ...todo,
        status: todo.status !== "archived" ? "archived" : "yet"
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