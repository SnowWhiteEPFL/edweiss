import { Collections, getDocument } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { AssignmentBase, Course } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { getCurrentTimeInMinutes } from '@/utils/calendar/getCurrentTimeInMinutes';
import { Time } from '@/utils/time';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, View } from 'react-native';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import { Day } from './Day';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 26;

export const Calendar = ({ courses, assignments, todos, type, date }: {
    courses: { id: string; data: Course; }[];
    assignments: { id: string; data: AssignmentBase; }[];
    todos: { id: string; data: Todolist.Todo; }[];
    type: "week" | "day" | undefined;
    date: Date
}) => {
    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
    const scrollViewRef = useRef<ScrollView>(null);
    const [user, setUser] = useState<any>(null);
    const userId = useAuth().uid;

    const [format, setFormat] = useState(type);

    useEffect(() => {
        if (type === undefined) setFormat("day");
    }, [type]);

    useEffect(() => {
        const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
            const orientationValue = currentOrientation.orientationInfo.orientation;
            if (type === undefined) {
                setFormat(orientationValue === 1 || orientationValue === 2 ? "day" : "week");
            }
        };
        const screenOrientationListener = ScreenOrientation.addOrientationChangeListener(onOrientationChange);
        return () => ScreenOrientation.removeOrientationChangeListener(screenOrientationListener);
    }, [type]);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getDocument(Collections.users, userId);
            setUser(userData);
        };
        fetchUser();
    }, [userId]);

    useEffect(() => {
        const interval = setInterval(() => setCurrentMinutes(getCurrentTimeInMinutes()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
    }, [currentMinutes]);

    const renderDay = (dayDate: Date) => {
        const dayIndex = dayDate.getDay();
        const dailyAssignments = assignments.filter(assignment => {
            const assignmentDate = new Date(Time.toDate(assignment.data.dueDate));
            return assignmentDate.toDateString() === dayDate.toDateString();
        });
        const dailyTodos = todos?.filter(todo => {
            const todoDate = todo.data?.dueDate ? new Date(Time.toDate(todo.data.dueDate)) : null;
            return todoDate?.toDateString() === dayDate.toDateString();
        });

        return (
            <TView key={dayIndex} flex={1}>
                {Array.from({ length: TOTAL_HOURS }).map((_, hour) => {
                    const hourTodos = dailyTodos?.filter(todo => todo.data.dueDate && new Date(Time.toDate(todo.data.dueDate)).getHours() === hour);
                    const hourAssignments = dailyAssignments?.filter(assignment => new Date(Time.toDate(assignment.data.dueDate)).getHours() === hour);
                    const filteredPeriods = courses.flatMap(course => course.data.periods.filter(period => period.dayIndex === dayIndex && period.start >= hour * 60 && period.start < (hour + 1) * 60));
                    const filteredCourses = courses.filter(course => filteredPeriods.some(period => period.dayIndex === dayIndex && period.start >= hour * 60 && period.start < (hour + 1) * 60));
                    return (
                        <TView key={`hour-${dayIndex}-${hour}`} bb={1} bl={1} borderColor='pink' style={{ height: HOUR_BLOCK_HEIGHT }} flexDirection="row">
                            <TView flexDirection="row" flex={1}>
                                <Day
                                    key={`${dayIndex}-${hour}`}
                                    course={filteredCourses}
                                    user={user}
                                    filteredPeriods={filteredPeriods}
                                    format={format ?? "day"}
                                    assignments={hourAssignments}
                                    todos={hourTodos}
                                />
                            </TView>
                        </TView>
                    );
                })}

                {dayIndex === date.getDay() && (
                    <TView
                        backgroundColor='red'
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

    return (
        <TView mb={16} flex={1} key={userId}>
            {format === "day" && (
                <>
                    <TText color='flamingo' size={12} style={{ width: '86%' }}>
                        {date.toDateString()}
                    </TText>
                    <TTouchableOpacity radius={10} p={5} style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderWidth: 2, borderColor: 'pink' }}
                        onPress={() => scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 0.8) * HOUR_BLOCK_HEIGHT, animated: true })}
                    >
                        <TText color='pink' align='center'>now</TText>
                    </TTouchableOpacity>
                </>
            )}

            {format === "week" && (
                <View style={{ flexDirection: 'row' }}>
                    <TView style={{ width: '5%' }} />
                    {getWeekDates(date).map((weekDate, index) => (
                        <TText key={index} align='center' style={{ width: '13.3%' }}>
                            {weekDate.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </TText>
                    ))}
                </View>
            )}

            <ScrollView ref={scrollViewRef} style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                <TView flexDirection="row">
                    <TView style={(format === 'week' ? { width: '5%' } : { width: '14%' })}>
                        {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
                            <TView key={`hour-${date.getTime()}-${hour}`} alignItems='center' justifyContent='center' bt={1} bb={1} borderColor='yellow' style={{ height: HOUR_BLOCK_HEIGHT }}>
                                <TText color='text' size={12}>{`${hour}:00`}</TText>
                            </TView>
                        ))}
                    </TView>

                    {format === "day" && renderDay(date)}
                    {format === "week" && (
                        <TView flexDirection="row" style={{ flex: 1 }}>
                            {getWeekDates(date).map((weekDate) => (
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
