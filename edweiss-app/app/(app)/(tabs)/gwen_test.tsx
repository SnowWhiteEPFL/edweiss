import { Calendar } from '@/components/core/calendar';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { AssignmentBase, Course } from '@/model/school/courses';
import Todolist from '@/model/todo';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, View } from 'react-native';

const { width } = Dimensions.get('window');

const InfinitePaginatedCounterScreen = () => {

    const auth = useAuth();
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState([0, 1, 2]);
    const scrollRef = useRef<FlatList>(null);
    const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
    const [isHorizontal, setIsHorizontal] = useState(width > Dimensions.get('window').height);
    const type = isHorizontal ? "week" : "day";
    const [format, setFormat] = useState<string>(type);

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
        const handleResize = () => {
            const newWidth = Dimensions.get('window').width;
            const newHeight = Dimensions.get('window').height;
            setWindowWidth(newWidth);
            setIsHorizontal(newWidth > newHeight);
        };
        const subscription = Dimensions.addEventListener('change', handleResize);
        return () => subscription?.remove();
    }, []);

    // Récupérer les cours de l'utilisateur
    const my_courses = useDynamicDocs(
        CollectionOf<Course>("users/" + (auth.authUser?.uid ?? 'default-uid') + "/courses")
    )?.map(doc => ({
        id: doc.id,
        data: doc.data
    })) ?? [];
    const my_todo = useDynamicDocs(
        CollectionOf<Todolist.Todo>("users/" + (auth.authUser?.uid ?? 'default-uid') + "/todos")
    )?.map(doc => ({
        id: doc.id,
        data: doc.data
    })) ?? [];

    // Récupérer les cours disponibles
    const courses = useDynamicDocs(CollectionOf<Course>("courses"))?.map(doc => ({
        id: doc.id,
        data: doc.data
    })) ?? [];


    const [assignmentsByCourse, setAssignmentsByCourse] = useState<Record<string, AssignmentBase[]>>({});
    const [todoByCourse, settodoByCourse] = useState<Record<string, Todolist.Todo[]>>({});

    useEffect(() => {
        if (courses.length > 0) {
            const fetchAssignments = async () => {
                const assignmentsData: Record<string, AssignmentBase[]> = {};
                for (const course of courses) {
                    const assignmentsRef = CollectionOf<AssignmentBase>(`courses/${course.id}/assignments`);
                    const assignmentsSnapshot = await assignmentsRef.get();
                    assignmentsData[course.id] = assignmentsSnapshot.docs.map(doc => doc.data() as AssignmentBase);
                }
                setAssignmentsByCourse(assignmentsData);
            };
            fetchAssignments();
        }
    }, [courses]);
    useEffect(() => {
        if (courses.length > 0) {
            const fetchTodo = async () => {
                const todoData: Record<string, Todolist.Todo[]> = {};
                for (const course of courses) {
                    const todoRef = CollectionOf<Todolist.Todo>("users/" + (auth.authUser?.uid ?? 'default-uid') + "/todos");
                    const todoSnapshot = await todoRef.get();
                    todoData[course.id] = todoSnapshot.docs.map(doc => doc.data() as Todolist.Todo);
                }
                settodoByCourse(todoData);
            };
            fetchTodo();
        }
    }, [courses]);

    useEffect(() => {
        if (courses.length > 0 && my_courses.length > 0) {
            setLoading(false);
        }
    }, [courses, my_courses]);

    const myCourseIds = my_courses.map(course => course.id);
    const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));
    const { height } = Dimensions.get('window');

    const loadMorePages = () => {
        setPages((prevPages) => [...prevPages, prevPages[prevPages.length - 1] + 1]);
    };

    const getDateWithOffset = (offset: number): Date => {
        const date = new Date();
        date.setDate(date.getDate() + offset);
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
                        renderItem={({ item }) => {
                            const newWidth = Dimensions.get('window').width;
                            const newHeight = Dimensions.get('window').height;
                            const adjustedItem = newWidth > newHeight ? item * 7 : item;
                            const currentDate = getDateWithOffset(adjustedItem);
                            return (
                                <View style={{
                                    width: windowWidth,
                                    height: height,
                                }}>
                                    <Animated.View style={{ height: height }}>
                                        <Calendar
                                            courses={filteredCourses}
                                            assignments={filteredCourses.flatMap(course => (assignmentsByCourse[course.id] || []).map(assignment => ({ id: course.id, data: assignment })))}
                                            todos={filteredCourses.flatMap(course => (todoByCourse[course.id] || []).map(todo => ({ id: course.id, data: todo })))}
                                            type={undefined}
                                            date={currentDate}
                                        />
                                    </Animated.View>
                                </View>
                            );
                        }}
                    />
                </>
            )}
        </View>
    );
};

export default InfinitePaginatedCounterScreen;
