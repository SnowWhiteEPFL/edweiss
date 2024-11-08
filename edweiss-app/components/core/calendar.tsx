import { Collections, getDocument } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { Course } from '@/model/school/courses';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, ScrollView, View } from 'react-native';
import TTouchableOpacity from './containers/TTouchableOpacity';
import TView from './containers/TView';
import { Day } from './Day';
import For from './For';
import { getCurrentDay } from './getCurrentDay';
import { getCurrentTimeInMinutes } from './getCurrentTimeInMinutes';
import TText from './TText';

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 24;

const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const screenWidth = Dimensions.get('window').width;

export const Calendar = ({ courses, type }: { courses: { id: string; data: Course; }[]; type: "week" | "day" | undefined; }) => {
    const actualDate = new Date();
    const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
    const [user, setUser] = useState<any>(null);
    const userId = useAuth().uid;

    const [format, setFormat] = useState(type);

    useEffect(() => {
        if (type === undefined) {
            setFormat("day");
        }
    }, [type]);
    useEffect(() => {
        actualDate.setDate(actualDate.getDate());
    }, [actualDate]);

    useEffect(() => {
        const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
            const orientationValue = currentOrientation.orientationInfo.orientation;
            if (type === undefined) {
                if (orientationValue === ScreenOrientation.Orientation.PORTRAIT_UP ||
                    orientationValue === ScreenOrientation.Orientation.PORTRAIT_DOWN) {
                    setFormat("day");
                } else {
                    setFormat("week");
                }
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

    const renderDay = (dayIndex: number) => (
        <TView key={dayIndex} flex={1}>
            {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
                <TView
                    key={hour}
                    bb={1}
                    bl={1}
                    borderColor='pink'
                    style={{
                        height: HOUR_BLOCK_HEIGHT,
                    }}
                    flexDirection="row"
                >
                    <TView flexDirection="row" flex={1}>
                        <For each={courses}>
                            {course =>
                                course.data.periods
                                    .filter(
                                        period => period.start >= hour * 60 && period.start < (hour + 1) * 60 && period.dayIndex === dayIndex
                                    )
                                    .map((period, index, filteredPeriods) => (
                                        <Day
                                            key={period.activityId}
                                            period={period}
                                            course={course}
                                            user={user}
                                            filteredPeriods={filteredPeriods}
                                            index={index}
                                            format={format || "day"}
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
                <>
                    <TText align='center' pt={10} pb={10} color='pink'>{actualDate.toDateString()}</TText>
                    <TTouchableOpacity
                        radius={10}
                        p={5}
                        style={{
                            marginVertical: 8,
                            width: '100%',
                            borderRadius: 10,
                            borderWidth: 2,
                            borderColor: 'pink'
                        }}
                        onPress={() => {
                            actualDate.setDate(new Date(actualDate.setDate(actualDate.getDate() + 1)).getDate());
                        }}
                    >
                        <TText color='pink' align='center'>now</TText>
                    </TTouchableOpacity>
                </>
            )}

            {format === "week" && (
                <TView flexDirection="row">
                    {DAY_NAMES.map((dayName, index) => (
                        <TText key={index} align='center' style={{ width: '13.3%' }}>
                            {dayName}
                        </TText>
                    ))}
                </TView>
            )}

            <FlatList
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: 'row' }}
                initialScrollIndex={getCurrentDay()}
                data={DAY_ORDER}
                keyExtractor={(item) => item.toString()}
                renderItem={({ item: dayIndex }) => (
                    <View style={{ width: screenWidth }}>
                        <ScrollView
                            showsVerticalScrollIndicator={true}
                            contentContainerStyle={{ flexGrow: 1 }}
                        >
                            <TView flexDirection="row">
                                <TView style={(format === 'week' && { width: '7%' }) || (format === 'day' && { width: '14%' })}>
                                    {Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
                                        <TView
                                            key={hour}
                                            alignItems='center'
                                            justifyContent='center'
                                            bt={1}
                                            bb={1}
                                            borderColor='yellow'
                                            style={{ height: HOUR_BLOCK_HEIGHT }}
                                        >
                                            <TText color='text' size={12}>{`${hour}:00`}</TText>
                                        </TView>
                                    ))}
                                </TView>

                                {format === "day" && renderDay(dayIndex)}
                                {format === "week" && (
                                    <TView flexDirection="row" style={{ flex: 1 }}>
                                        {DAY_ORDER.map(dayIdx => renderDay(dayIdx))}
                                    </TView>
                                )}
                            </TView>
                        </ScrollView>
                    </View>
                )}
                getItemLayout={(data, index) => ({
                    length: screenWidth, // width of each item
                    offset: screenWidth * index, // calculate the offset for each item
                    index,
                })}
            />


        </TView>
    );
};

