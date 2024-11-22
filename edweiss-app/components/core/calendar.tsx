import { Collections, getDocument } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { AssignmentBase, Course } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { getCurrentTimeInMinutes } from '@/utils/calendar/getCurrentTimeInMinutes';
import { Time } from '@/utils/time';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView } from 'react-native';
import TView from './containers/TView';
import { Day } from './Day';
import { getWeekDates } from './getWeekDates';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80; // Height of each hour block in the calendar view
const TOTAL_HOURS = 24; // Total hours displayed on the calendar

export const Calendar = ({
    courses,
    assignments,
    todos,
    type,
    date,
}: {
    courses: { id: string; data: Course }[];
    assignments: { id: string; data: AssignmentBase }[];
    todos: { id: string; data: Todolist.Todo }[];
    type: 'week' | 'day' | undefined;
    date: Date;
}) => {
    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
    const scrollViewRef = useRef<ScrollView>(null);
    const [user, setUser] = useState<any>(null);
    const userId = useAuth().uid;
    const [format, setFormat] = useState(type);

    // Update the format if type is undefined
    useEffect(() => {
        if (type === undefined) setFormat('day');
    }, [type]);

    // Handle screen orientation changes
    useEffect(() => {
        const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
            const orientationValue = currentOrientation.orientationInfo.orientation;
            if (type === undefined) {
                setFormat(orientationValue === 1 || orientationValue === 2 ? 'day' : 'week');
            }
        };
        const screenOrientationListener = ScreenOrientation.addOrientationChangeListener(onOrientationChange);
        return () => ScreenOrientation.removeOrientationChangeListener(screenOrientationListener);
    }, [type]);

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getDocument(Collections.users, userId);
            setUser(userData);
        };
        fetchUser();
    }, [userId]);

    // Update current minutes every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentMinutes(getCurrentTimeInMinutes()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Scroll to current time block
    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
    }, [currentMinutes]);

    // Memoize the week dates
    const weekDates = useMemo(() => getWeekDates(date), [date]);

    const renderDay = (dayDate: Date) => {
        const dayIndex = dayDate.getDay();

        // Filter assignments and todos for the given day
        const dailyAssignments = assignments.filter(assignment => {
            const assignmentDate = Time.toDate(assignment.data.dueDate);
            return (
                assignmentDate.getDate() === dayDate.getDate() &&
                assignmentDate.getMonth() === dayDate.getMonth() &&
                assignmentDate.getFullYear() === dayDate.getFullYear()
            );
        });

        const dailyTodos = todos?.filter(todo => {
            const todoDate = todo.data?.dueDate ? Time.toDate(todo.data.dueDate) : null;
            return (
                todoDate?.getDate() === dayDate.getDate() &&
                todoDate?.getMonth() === dayDate.getMonth() &&
                todoDate?.getFullYear() === dayDate.getFullYear()
            );
        });

        return (
            <TView key={dayDate.toISOString()} flex={1}>
                {/* Render each hour block */}
                {Array.from({ length: TOTAL_HOURS }).map((_, hour) => {
                    const hourTodos = dailyTodos?.filter(
                        todo =>
                            todo.data.dueDate &&
                            new Date(Time.toDate(todo.data.dueDate)).getHours() === hour
                    );
                    const hourAssignments = dailyAssignments?.filter(
                        assignment =>
                            new Date(Time.toDate(assignment.data.dueDate)).getHours() === hour
                    );
                    const filteredPeriods = courses.flatMap(course =>
                        course.data.periods.filter(
                            period =>
                                period.dayIndex === dayIndex &&
                                period.start >= hour * 60 &&
                                period.start < (hour + 1) * 60
                        )
                    );
                    const filteredCourses = courses.filter(course =>
                        filteredPeriods.some(
                            period =>
                                period.dayIndex === dayIndex &&
                                period.start >= hour * 60 &&
                                period.start < (hour + 1) * 60
                        )
                    );
                    return (
                        <TView
                            key={`hour-${dayIndex}-${hour}`}
                            bb={1}
                            bl={1}
                            borderColor="overlay2"
                            style={{ height: HOUR_BLOCK_HEIGHT }}
                            flexDirection="row"
                        >
                            <TView flexDirection="row" flex={1}>
                                {/* Render course periods, assignments, and todos */}
                                <Day
                                    key={`${dayIndex}-${hour}`}
                                    course={filteredCourses}
                                    user={user}
                                    filteredPeriods={filteredPeriods}
                                    format={format ?? 'day'}
                                    assignments={hourAssignments}
                                    todos={hourTodos}
                                />
                            </TView>
                        </TView>
                    );
                })}

                {/* Red line for current time */}
                {dayDate.getDate() === date.getDate() && (
                    <TView
                        backgroundColor="red"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: 2,
                            top: (currentMinutes / 60) * HOUR_BLOCK_HEIGHT,
                        }}
                    />
                )}
            </TView>
        );
    };

    const stringDate =
        date.toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
        })


    return (
        <TView mb={16} flex={1} key={userId}>
            {/* Display current date */}
            {format === 'day' && (
                <TView pt={35} backgroundColor="constantBlack" alignItems="center">
                    <TText color="text" m={5} align="center" size="lg" style={{ width: '86%' }}>
                        {stringDate}
                    </TText>
                </TView>
            )}

            {/* Week view */}
            {format === 'week' && (
                <TView flexDirection="row" >
                    <TView style={{ width: '5%' }} />
                    {weekDates.map(weekDate => (
                        <TText
                            pt={20}
                            key={weekDate.toISOString()}
                            align="center"
                            style={{ width: '13.3%' }}
                        >
                            {weekDate.toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                            })}
                        </TText>
                    ))}
                </TView>
            )}

            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
            >
                <TView flexDirection="row">
                    {/* Render time labels */}
                    <TView style={format === 'week' ? { width: '5%' } : { width: '14%' }}>
                        {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
                            <TView
                                key={`hour-${date.getTime()}-${hour}`}
                                alignItems="center"
                                justifyContent="center"
                                bt={1}
                                bb={1}
                                borderColor="overlay0"
                                backgroundColor="constantBlack"
                                style={{ height: HOUR_BLOCK_HEIGHT }}
                            >
                                <TText color="text" size={12}>{`${hour}:00`}</TText>
                            </TView>
                        ))}
                    </TView>

                    {/* Render day or week view */}
                    {format === 'day' && renderDay(date)}
                    {format === 'week' && (
                        <TView flexDirection="row" style={{ flex: 1 }}>
                            {weekDates.map(weekDate => (
                                <TView key={weekDate.toISOString()} style={{ width: '14.28%' }}>
                                    {renderDay(weekDate)}
                                </TView>
                            ))}
                        </TView>
                    )}
                </TView>
            </ScrollView>
        </TView>
    );
};
