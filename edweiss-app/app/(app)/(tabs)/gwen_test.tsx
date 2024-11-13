import { Calendar } from '@/components/core/calendar';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, View } from 'react-native';

const { width } = Dimensions.get('window');
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const InfinitePaginatedCounterScreen = () => {

    const auth = useAuth();
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([0, 1, 2]);
    const scrollRef = useRef<FlatList>(null);
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isHorizontal, setIsHorizontal] = useState(width > Dimensions.get('window').height);
    const type = isHorizontal ? "week" : "day";
    const [format, setFormat] = useState<"week" | "day" | undefined>(type);

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


    const courses = useDynamicDocs(CollectionOf<Course>("courses"))?.map(doc => ({
        id: doc.id,
        data: doc.data
    })) ?? [];

    const my_courses = useDynamicDocs(
        CollectionOf<Course>("users/" + (auth.authUser?.uid ?? 'default-uid') + "/courses")
    )?.map(doc => ({
        id: doc.id,
        data: doc.data
    })) ?? [];

    useEffect(() => {
        if (courses.length > 0 && my_courses.length > 0) {
            setLoading(false);
        }
    }, [courses, my_courses]);

    const myCourseIds = my_courses.map(course => course.id);
    const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));
    const { height } = Dimensions.get('window');

    const loadMorePages = () => {
        setPages((prevPages) => {
            const lastPage = prevPages[prevPages.length - 1];
            const newPages = Array.from({ length: 7 }, (_, i) => lastPage + i + 1);
            return [...prevPages, ...newPages];
        });
    };

    const getDateWithOffset = (offset: number): Date => {
        const date = new Date();
        date.setDate(date.getDate() + offset + (format === "week" ? 7 : 0));
        return date;
    };

    return (
        <View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <FlatList
                        ref={scrollRef}
                        data={pages}
                        horizontal
                        pagingEnabled
                        keyExtractor={(item) => item.toString()}
                        onEndReached={loadMorePages}
                        onEndReachedThreshold={0.1}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <View style={{
                                width: windowWidth,
                                height: height,
                            }}>
                                <Animated.View style={{ height: height }}>
                                    <Calendar courses={filteredCourses} type={format} date={getDateWithOffset(item)} />
                                </Animated.View>
                            </View>
                        )}
                    />
                </>
            )}
        </View>
    );
};

export default InfinitePaginatedCounterScreen;
