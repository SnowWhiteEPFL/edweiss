import { calculateTopOffset, formatDateToReadable2, formatTime, generateWeekDates } from '@/components/calendar/functions';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';

import Icon from '@/components/core/Icon';
import TText from '@/components/core/TText';
import { useUser } from '@/contexts/user';
import { CustomEvents } from '@/model/school/Events';
import { getCurrentTimeInMinutes } from '@/utils/calendar/getCurrentTimeInMinutes';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, ScrollView, useWindowDimensions } from 'react-native';
import { EventsByDate, getNavigationDetails } from '.';


const HOUR_BLOCK_HEIGHT = 80; // Height of an hour block

const verticalCalendar = ({ eventsByDate }: { eventsByDate: EventsByDate }) => {
    const { user } = useUser();
    const { width, height } = useWindowDimensions();
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());

    useEffect(() => {
        // Automatically scroll to the current time on component mount
        scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
    }, [currentMinutes]);

    useEffect(() => {
        // Update the current time every minute
        const interval = setInterval(() => setCurrentMinutes(getCurrentTimeInMinutes()), 60000);
        return () => clearInterval(interval);
    }, []);

    const renderBlocks = (events: CustomEvents[], item: string) => {
        // Render the hourly blocks and events for a specific day
        const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
        const currentPosition = (currentMinutes / 60) * HOUR_BLOCK_HEIGHT; // Adjust according to height (80 pixels per hour)

        const blocks = Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            events: events.filter(
                (event) => event.startTime >= i * 60 && event.startTime < (i + 1) * 60
            ),
        }));

        return (
            <TView style={{ flexDirection: 'column', position: 'relative' }}>
                {/* Red line indicating the current time */}
                {item === new Date().toISOString().split('T')[0] && (
                    <TView
                        style={{
                            position: 'absolute',
                            top: currentPosition,
                            left: 0,
                            right: 0,
                            height: 2,
                            backgroundColor: 'red',

                        }}
                    />
                )}

                {blocks.map((block, index) => (
                    <TView
                        key={index}
                        style={{
                            flexDirection: 'row',

                            height: HOUR_BLOCK_HEIGHT, // Fixed height per hour
                            borderBottomWidth: 1,
                            borderColor: '#ddd',
                        }}
                    >
                        {/* Hour text */}
                        <TView
                            style={{
                                width: 50,
                                alignItems: 'flex-start',
                            }}
                        >
                            <TText style={{ color: '#aaa', fontSize: 14 }}>
                                {`${block.hour.toString().padStart(2, '0')}:00`}
                            </TText>
                        </TView>

                        {/* Events */}
                        {block.events.length > 0 && (
                            <TView
                                style={{
                                    flex: 1,
                                    padding: 0,
                                }}
                            >
                                {block.events.map((event, i) => {
                                    const eventDuration = event.endTime
                                        ? event.endTime - event.startTime
                                        : 0; // Calculate duration in minutes
                                    const eventHeight = ((eventDuration / 60) * HOUR_BLOCK_HEIGHT) > 120 ? ((eventDuration / 60) * HOUR_BLOCK_HEIGHT) : event.type == "Course" ? 120 : HOUR_BLOCK_HEIGHT; // Convert to pixels
                                    const { pathname, params } = event.period && event.course ? getNavigationDetails(user, event.course, event.period, index) : { pathname: '', params: {} };
                                    const todoParams = event.todo
                                        ? { todo: JSON.stringify(event.todo) } // Serialize the object
                                        : {};
                                    const assignmentPath = `/(app)/quiz/quizStudentView`;
                                    const assignmentParams = { quizId: event.assignmentID, courseId: event.course?.id }

                                    return (
                                        <TTouchableOpacity
                                            onPress={() => {
                                                if (event.type == "Course") {
                                                    router.push({ pathname: pathname as any, params });
                                                } else if (event.type == "Todo") {
                                                    router.push({ pathname: '/(app)/todos', params: todoParams });
                                                }
                                                else {
                                                    router.push({ pathname: assignmentPath, params: assignmentParams });
                                                }
                                            }}
                                            key={i}
                                            style={{
                                                top: calculateTopOffset(formatTime(event.startTime)), // Offset for the event
                                                padding: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#f9f9f9',
                                                borderWidth: 1,
                                                borderColor: '#ddd',

                                                height: eventHeight, // Height of the event
                                            }}
                                        >
                                            <TText
                                                size={'sm'}
                                                color='constantBlack'
                                                bold={true}
                                            >
                                                {event.name}
                                            </TText>
                                            {event.endTime !== undefined ? (
                                                <>
                                                    {/* Display startTime and endTime */}
                                                    <TText size='xs' color='text'>
                                                        Start: {formatTime(event.startTime)}
                                                    </TText>
                                                    <TText size='xs' color='text'>
                                                        End: {formatTime(event.endTime)}
                                                    </TText>


                                                </>
                                            ) : (
                                                <>
                                                    {/* Display only startTime with a custom label */}
                                                    <TText size='xs' color='text'>
                                                        Scheduled at: {formatTime(event.startTime)}
                                                    </TText>

                                                </>
                                            )}

                                            {event.rooms && (
                                                <TText size='xs' color='text'>
                                                    Rooms : {event.rooms.toLocaleString()}
                                                </TText>
                                            )
                                            }
                                        </TTouchableOpacity>
                                    );
                                })}
                            </TView>
                        )}
                    </TView>
                ))}
            </TView>
        );
    };


    // Render a specific day with its events
    const renderDay = ({ item }: { item: string }) => {
        const events = eventsByDate[item] || [];
        return (
            <TView style={{ width, height }}>
                <TText size={'xl'} pt={30} mt={30} align='center' style={{ fontWeight: 'bold', marginBottom: 16 }}>
                    {formatDateToReadable2(new Date(item))}
                </TText>
                <ScrollView style={{ width, padding: 8 }} ref={scrollViewRef}>
                    {renderBlocks(events, item)}
                </ScrollView>

                <TTouchableOpacity
                    onPress={() => router.push('/(app)/(tabs)/todos')}
                    p={10} radius={100}
                    backgroundColor='base'
                    m='md' mt={'sm'} mb={'sm'}

                    b={'sm'} borderColor='overlay0'
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        zIndex: 100

                    }}
                    testID='add-todo-button'
                >
                    <Icon name="server" color='blue' size={30}></Icon>
                </TTouchableOpacity >

            </TView>
        );
    };

    const weekDates = generateWeekDates();



    return (
        <FlatList
            data={weekDates}
            horizontal
            pagingEnabled
            keyExtractor={(item) => item}
            renderItem={renderDay}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ alignItems: 'center' }}
        />
    );
};

export default verticalCalendar;


