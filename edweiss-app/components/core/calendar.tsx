import { Collections, getDocument } from '@/config/firebase';
import { Color } from '@/constants/Colors';
import { TIME_CONSTANTS } from '@/constants/Time';
import { useAuth } from '@/contexts/auth';
import { Course, courseColors } from '@/model/school/courses';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import For from './For';
import formatTime from './formatTime';
import { getCurrentDay } from './getCurrentDay';
import { getCurrentTimeInMinutes } from './getCurrentTimeInMinutes';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80;



export const Calendar = ({ courses }: { courses: { id: string; data: Course; }[]; }) => {
    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
    const scrollViewRef = useRef<ScrollView>(null);
    const [user, setUser] = useState<any>(null);
    const userId = useAuth().uid;

    useEffect(() => {
        const fetchUser = async () => {
            const userData = await getDocument(Collections.users, userId);
            setUser(userData);
        };
        fetchUser();
    }, [userId]);
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentMinutes(getCurrentTimeInMinutes());
        }, TIME_CONSTANTS.ONE_MINUTE_IN_MS);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollViewRef.current?.scrollTo({ y: (currentMinutes / TIME_CONSTANTS.MINUTES_IN_HOUR - 1) * HOUR_BLOCK_HEIGHT, animated: true });
    }, [currentMinutes]);

    return (
        <TView mb={16} flex={1} key={userId}>
            <TText align='center'>My Calendar</TText>
            <TTouchableOpacity borderColor='yellow' b={2} radius={10} p={5}
                style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderWidth: 2 }}
                onPress={() => scrollViewRef.current?.scrollTo({ y: (currentMinutes / TIME_CONSTANTS.MINUTES_IN_HOUR - 0.8) * HOUR_BLOCK_HEIGHT, animated: true })}
            >
                <TText color='yellow' align='center'>now</TText>
            </TTouchableOpacity>
            <ScrollView
                ref={scrollViewRef}
                style={{ flex: 1 }}
                showsVerticalScrollIndicator={true}
            >

                {Array.from({ length: TIME_CONSTANTS.TOTAL_HOURS }).map((_, hour) => (
                    <><TView key={hour} pl={10} pr={10} style={{
                        height: HOUR_BLOCK_HEIGHT,
                        borderBottomWidth: 1,
                    }} flexDirection="row">
                        <TText color='text' size={12} mr={5} mt={35} style={{ width: 40 }}>{`${hour}:00`}</TText>
                        <TView flexDirection="row" flex={1}>
                            <For each={courses} key="id">
                                {course =>
                                    course.data.periods
                                        .filter(
                                            period =>
                                                period.start >= hour * TIME_CONSTANTS.MINUTES_IN_HOUR &&
                                                period.start < (hour + 1) * TIME_CONSTANTS.MINUTES_IN_HOUR &&
                                                period.dayIndex === getCurrentDay()
                                        )
                                        .map((period, index, filteredPeriods) => {
                                            const periodHeight = period.end
                                                ? ((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT
                                                : HOUR_BLOCK_HEIGHT;

                                            return (

                                                <TView
                                                    key={index}
                                                    flex={1 / filteredPeriods.length}
                                                    borderColor="overlay2"
                                                    radius={10}
                                                    b={2}
                                                    p={2}
                                                    backgroundColor={courseColors[period.type] as Color || 'base'}
                                                    style={{
                                                        height: periodHeight
                                                    }}
                                                >
                                                    <TView flexDirection="column">
                                                        <TView flexDirection="row" justifyContent="space-between">
                                                            <TText color="course_title_for_backgroud_color" numberOfLines={1} size={15} p={5}>
                                                                {`${period.type.charAt(0).toUpperCase() + period.type.slice(1)}`}
                                                            </TText>
                                                            <TText pr={10} pt={7} color="overlay2" numberOfLines={1} size={12}>
                                                                {`${period.rooms.join(", ")}`}
                                                            </TText>
                                                        </TView>
                                                        <TText pl={5} color="overlay2" numberOfLines={1} size={12}>
                                                            {`${course.data.name}`}
                                                        </TText>
                                                        <TView flexDirection="row">
                                                            <TText p={5} size={12} color="overlay2">
                                                                {`${formatTime(period.start)} - ${formatTime(period.end)}`}
                                                            </TText>
                                                            {user.data.type == 'student' && course.data.started && period.type == 'lecture' && <TText p={5} onPress={() => router.push(`/(app)/test_showTime`)} size={15} color="red">Join Course</TText>}
                                                            {user.data.type == 'professor' && period.type == 'lecture' && <TText p={5} onPress={() => router.push({
                                                                pathname: '/(app)/startCourseScreen',
                                                                params: {
                                                                    courseID: course.id, course: JSON.stringify(course.data),
                                                                }
                                                            })} size={15} color="red">{(course.data.started == false && "Start Course") || (course.data.started == true && "Stop Course")}</TText>}
                                                        </TView>
                                                    </TView>
                                                </TView>
                                            );
                                        })
                                }
                            </For>
                        </TView>
                    </TView>
                        <TView
                            backgroundColor='red'
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: 2,
                                top: (currentMinutes / TIME_CONSTANTS.MINUTES_IN_HOUR) * HOUR_BLOCK_HEIGHT,
                            }}
                        />
                    </>
                ))}
            </ScrollView>
        </TView>

    );
};