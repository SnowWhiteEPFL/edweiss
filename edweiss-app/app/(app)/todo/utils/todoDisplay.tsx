/**
 * @file todoDisplay.tsx
 * @description This file contains the display components for the todo list
 * @author Adamm Alaoui
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import FancyButton from '@/components/input/FancyButton';
import t from '@/config/i18config';
import { LightDarkProps } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import useThemeColor from '@/hooks/theme/useThemeColor';
import Todolist from '@/model/todo';
import { Time } from '@/utils/time';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useRouter } from 'expo-router';
import React, { Dispatch, SetStateAction, useRef } from 'react';
import { Animated, Dimensions, Vibration } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { statusColorMap, statusIconMap, statusNextAction, statusNextMap, toogleArchivityOfTodo } from './utilsFunctions';

// Types
type Todo = Todolist.Todo;
type TodoStatus = Todolist.TodoStatus;



// ------------------------------------------------------------
// --------------------   Todo Display Component   ------------
// ------------------------------------------------------------

export const TodoDisplay: React.FC<{
    key: string, id: string, todo: Todo;
    setTodoToDisplay: React.Dispatch<React.SetStateAction<Todo | undefined>>;
    modalRef: React.RefObject<BottomSheetModalMethods>;
} & LightDarkProps
> = ({ id, light, dark, todo, setTodoToDisplay, modalRef }) => {

    // Constants
    const date = (todo.dueDate) ? Time.toDate(todo.dueDate) : undefined;
    const dateString = date ?
        (Time.isToday(date) ? t('todo:today_status') :
            Time.wasYesterday(date) ? t('todo:yesterday_status') :
                Time.isTomorrow(date) ? t('todo:tomorrow_status') :
                    date.toLocaleDateString()) : undefined;

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
     * to toogle todo archivity status
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
     * vertical/horizontal scroll
     */
    const onHandlerStateChange = (event: any) => {
        const { state, translationY, translationX } = event.nativeEvent;

        // Note: Record the starting position of the gesture
        if (state === State.BEGAN) {
            gestureStartX.current = event.nativeEvent.x;
            gestureStartY.current = event.nativeEvent.y;
            isEdgeSwipe.current = (gestureStartX.current <= edgeZoneWidth ||
                gestureStartX.current >= screenWidth - edgeZoneWidth);
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
                                        onLongPress={() => {
                                            Vibration.vibrate(100);
                                            router.push({
                                                pathname: "/(app)/todo/edit",
                                                params: { idString: id, todoJSON: JSON.stringify(todo) }
                                            });
                                        }}
                                    >

                                        <TText color='text' bold numberOfLines={1} ellipsizeMode='tail'>
                                            {todo.name}
                                        </TText>

                                        {todo.dueDate && (
                                            <TText color='subtext0' size={'sm'} bold numberOfLines={1} ellipsizeMode='tail'>
                                                {dateString}
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
// -----------------------  FC  Utils  ------------------------
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



export const TodoStatusDisplay: ReactComponent<{ id: string, todo: Todo, status: TodoStatus; }> = ({ id, todo, status }) => {

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
