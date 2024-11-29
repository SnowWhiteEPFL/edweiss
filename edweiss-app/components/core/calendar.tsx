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

const HOUR_BLOCK_HEIGHT = 80; // Hauteur de chaque bloc horaire dans la vue du calendrier
const TOTAL_HOURS = 24; // Total des heures affichées sur le calendrier


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
    const [user, setUser] = useState<any>(null);
    const userId = useAuth().uid;

    // Mise à jour du format si type est undefined
    useEffect(() => {
        if (type === undefined) setFormat('day');
    }, [type]);

    // Gestion des changements d'orientation de l'écran
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

    // Récupération des données utilisateur
    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getDocument(Collections.users, userId);
            setUser(userData);
        };
        fetchUser();
    }, [userId]);

    // Mise à jour des minutes actuelles toutes les minutes
    useEffect(() => {
        const interval = setInterval(() => setCurrentMinutes(getCurrentTimeInMinutes()), 60000);
        return () => clearInterval(interval);
    }, []);


    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
    const scrollViewRef = useRef<ScrollView>(null);

    const [format, setFormat] = useState(type ?? 'day');
    const weekDates = useMemo(() => getWeekDates(date), [date]);

    const hoursArray = useMemo(() => Array.from({ length: TOTAL_HOURS }, (_, i) => i), []);

    const dayIndex = useMemo(() => date.getDay(), [date]);
    // Défilement vers le bloc horaire actuel
    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
    }, [currentMinutes]);
    // Pré-calculer les données filtrées
    const { dailyAssignments, dailyTodos, hourlyData } = useMemo(() => {
        const dailyAssignments = assignments.filter(({ data }) => {
            const assignmentDate = Time.toDate(data.dueDate);
            return assignmentDate.toDateString() === date.toDateString();
        });

        const dailyTodos = todos.filter(({ data }) => {
            const todoDate = data?.dueDate ? Time.toDate(data.dueDate) : null;
            return todoDate?.toDateString() === date.toDateString();
        });

        const hourlyData = hoursArray.map(hour => {
            const filteredPeriods = courses.flatMap(({ data }) =>
                data.periods.filter(
                    period =>
                        period.dayIndex === dayIndex &&
                        period.start >= hour * 60 &&
                        period.start < (hour + 1) * 60
                )
            );

            return {
                hour,
                todos: dailyTodos.filter(todo =>
                    todo.data.dueDate && new Date(Time.toDate(todo.data.dueDate)).getHours() === hour
                ),
                assignments: dailyAssignments.filter(assignment =>
                    new Date(Time.toDate(assignment.data.dueDate)).getHours() === hour
                ),
                filteredCourses: courses.filter(({ data }) =>
                    filteredPeriods.some(
                        period =>
                            period.dayIndex === dayIndex &&
                            period.start >= hour * 60 &&
                            period.start < (hour + 1) * 60
                    )
                ),
                filteredPeriods,
            };
        });

        return { dailyAssignments, dailyTodos, hourlyData };
    }, [assignments, todos, courses, dayIndex, hoursArray, date]);

    const renderDay = () => {
        return (
            <TView flex={1}>
                {hourlyData.map(({ hour, todos, assignments, filteredPeriods, filteredCourses }) => (
                    (todos.length > 0 || assignments.length > 0 || filteredCourses.length > 0 || filteredPeriods.length > 0) ? (
                        <TView
                            key={`hour-${dayIndex}-${hour}`}
                            bb={1}
                            bl={1}
                            style={{ height: HOUR_BLOCK_HEIGHT }}
                            flexDirection="row"
                        >
                            <TView flexDirection="row" flex={1}>
                                <Day
                                    key={`${dayIndex}-${hour}`}
                                    course={filteredCourses}
                                    user={user}
                                    filteredPeriods={filteredPeriods}
                                    format={format ?? 'day'}
                                    assignments={assignments}
                                    todos={todos}
                                />
                            </TView>
                        </TView>
                    ) : null))}

                {date.getDate() === new Date().getDate() && (
                    <TView
                        testID="current-time-line"
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

    return (
        <TView mb={16} flex={1}>
            {format === 'day' && (
                <TView pt={35} backgroundColor="constantBlack" alignItems="center">
                    <TText color="text" m={5} align="center" size="lg" style={{ width: '86%' }}>
                        {date.toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                        })}
                    </TText>
                </TView>
            )}

            {format === 'week' && (
                <TView flexDirection="row">
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

            <ScrollView ref={scrollViewRef} style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                <TView flexDirection="row">
                    <TView style={format === 'week' ? { width: '5%' } : { width: '14%' }}>
                        {hoursArray.map(hour => (
                            <TView
                                key={`hour-label-${hour}`}
                                alignItems="center"
                                justifyContent="center"
                                style={{
                                    height: HOUR_BLOCK_HEIGHT,
                                    borderBottomWidth: 1,
                                }}
                            >
                                <TText size="sm" color="text">{`${hour}:00`}</TText>
                            </TView>
                        ))}
                    </TView>
                    <TView style={format === 'week' ? { width: '95%' } : { width: '86%' }}>
                        {renderDay()}
                    </TView>
                </TView>
            </ScrollView>
        </TView>
    );
};
