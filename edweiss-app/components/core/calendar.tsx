import { Collections, getDocument } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { Course } from '@/model/school/courses';
import { getCurrentDay } from '@/utils/calendar/getCurrentDay';
import { getCurrentTimeInMinutes } from '@/utils/calendar/getCurrentTimeInMinutes';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import { Day } from './Day';
import For from './For';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 26;

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];


export const Calendar = ({ courses, type, date }: { courses: { id: string; data: Course; }[]; type: "week" | "day" | undefined; date: Date }) => {

    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
    const scrollViewRef = useRef<ScrollView>(null);
    const [user, setUser] = useState<any>(null);
    const userId = useAuth().uid;

    const [format, setFormat] = useState(type);

    useEffect(() => {
        if (type === undefined) {
            setFormat("day");
        }
    }, [type]);
    useEffect(() => {
        const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
            const orientationValue = currentOrientation.orientationInfo.orientation;
            if (type === undefined) {
                if (orientationValue == 1 || orientationValue == 2) setFormat("day");
                else setFormat("week");
            }
        };
        const screenOrientationListener =
            ScreenOrientation.addOrientationChangeListener(onOrientationChange);

        return () => {
            ScreenOrientation.removeOrientationChangeListener(screenOrientationListener);
        };
    }, [type]);

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getDocument(Collections.users, userId);
            setUser(userData);
        };
        fetchUser();
    }, [userId]);

    useEffect(() => {
        const interval = setInterval(() => { setCurrentMinutes(getCurrentTimeInMinutes()); }, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
    }, []);

    const getWeekDates = () => {
        const today = date;
        const dayOfWeek = today.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Décaler pour commencer le lundi
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() + mondayOffset);

        const weekDates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            weekDates.push(date);
        }
        return weekDates;
    };
    const renderDay = (dayIndex: number) => (
        <TView key={dayIndex} flex={1} >
            {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
                <TView key={`hour-${dayIndex}-${hour}`} bb={1} bl={1} borderColor='pink' style={{
                    height: HOUR_BLOCK_HEIGHT,
                }} flexDirection="row">
                    <TView flexDirection="row" flex={1} >
                        <For each={courses}>
                            {course =>
                                course.data.periods
                                    .filter(
                                        period => period.start >= hour * 60 && period.start < (hour + 1) * 60 && period.dayIndex === dayIndex
                                    )
                                    .map((period, index, filteredPeriods) => (
                                        <Day
                                            key={`${period.dayIndex}-${period.start}-${index}`}
                                            period={period}
                                            course={course}
                                            user={user}
                                            filteredPeriods={filteredPeriods}
                                            index={index}
                                            format={format ?? "day"}
                                        />
                                    ))
                            }
                        </For>
                    </TView>
                </TView>
            ))}

            {dayIndex === getCurrentDay() && (
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

    return (
        <TView mb={16} flex={1} key={userId}>
            {format === "day" && (
                <><TText color='flamingo' size={12} style={{ width: '86%' }}>
                    {date.toDateString()}</TText><TTouchableOpacity radius={10} p={5}
                        style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderWidth: 2, borderColor: 'pink' }}
                        onPress={() => { scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 0.8) * HOUR_BLOCK_HEIGHT, animated: true }) }}
                    >
                        <TText color='pink' align='center'>now</TText>
                    </TTouchableOpacity></>
            )}

            {format === "week" && (
                <View style={{ flexDirection: 'row' }}>
                    <TView style={{ width: '5%' }}></TView>
                    {getWeekDates().map((date, index) => (
                        <TText key={index} align='center' style={{ width: '13.3%' }}>
                            {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </TText>
                    ))}
                </View>
            )}
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}>
                <TView flexDirection="row">
                    <TView style={(format == 'week' && { width: '5%' }) || (format == 'day' && { width: '14%' })}>
                        {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
                            <TView key={`hour-${new Date().getTime()}-${hour}`} alignItems='center' justifyContent='center' bt={1} bb={1} borderColor='yellow' style={{ height: HOUR_BLOCK_HEIGHT }}>
                                <TText color='text' size={12}>{`${hour}:00`}</TText>
                            </TView>
                        ))}
                    </TView>

                    {format === "day" && renderDay(getCurrentDay())}
                    {format === "week" && (
                        <TView flexDirection="row" style={{ flex: 1 }}>
                            {getWeekDates().map((date) => (
                                <TView key={date.toISOString()} style={{ width: '14.28%' }}>
                                    {renderDay(date.getDay())}
                                </TView>
                            ))}
                        </TView>
                    )}
                </TView>
            </ScrollView>
        </TView>
    );
};

