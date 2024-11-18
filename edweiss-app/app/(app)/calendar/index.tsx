import { Calendar } from '@/components/core/calendar';
import TView from '@/components/core/containers/TView';
import HeaderButton from '@/components/core/header/HeaderButton';
import HeaderButtons from '@/components/core/header/HeaderButtons';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { AssignmentBase, Course } from '@/model/school/courses';
import Todolist from '@/model/todo';
import { router } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, View } from 'react-native';

const { width } = Dimensions.get('window');

export const InfinitePaginatedCounterScreen = () => {

  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState([0, 1, 2]);
  const scrollRef = useRef<FlatList>(null);
  const [windowWidth, setWindowWidth] = useState(width);
  const [isHorizontal, setIsHorizontal] = useState(width > Dimensions.get('window').height);
  const type = isHorizontal ? "week" : "day";
  const [format, setFormat] = useState<string>(type);

  // Ensure default format is set to "day" if type is undefined
  useEffect(() => {
    if (!type) {
      setFormat("day");
    }
  }, [type]);

  // Listen for screen orientation changes to switch calendar view format
  useEffect(() => {
    const onOrientationChange = (currentOrientation: ScreenOrientation.OrientationChangeEvent) => {
      const orientation = currentOrientation.orientationInfo.orientation;
      setFormat(orientation === 1 || orientation === 2 ? "day" : "week");
    };
    const orientationListener = ScreenOrientation.addOrientationChangeListener(onOrientationChange);
    return () => {
      ScreenOrientation.removeOrientationChangeListener(orientationListener);
    };
  }, []);

  // Listen for window size changes to adjust layout direction
  useEffect(() => {
    const handleResize = () => {
      const newWidth = Dimensions.get('window').width;
      const newHeight = Dimensions.get('window').height;
      setWindowWidth(newWidth);
      setIsHorizontal(newWidth > newHeight);
    };
    const resizeSubscription = Dimensions.addEventListener('change', handleResize);
    return () => resizeSubscription?.remove();
  }, []);

  // Fetch user's courses and to-dos
  const myCourses = useDynamicDocs(
    CollectionOf<Course>(`users/${auth.authUser?.uid ?? 'default-uid'}/courses`)
  )?.map(doc => ({ id: doc.id, data: doc.data })) ?? [];

  // Fetch all available courses
  const courses = useDynamicDocs(CollectionOf<Course>("courses"))?.map(doc => ({
    id: doc.id,
    data: doc.data
  })) ?? [];

  const [assignmentsByCourse, setAssignmentsByCourse] = useState<Record<string, AssignmentBase[]>>({});
  const [todoByCourse, setTodoByCourse] = useState<Record<string, Todolist.Todo[]>>({});

  // Fetch assignments for each course
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

  // Fetch to-do items for each course
  useEffect(() => {
    if (courses.length > 0) {
      const fetchTodo = async () => {
        const todoData: Record<string, Todolist.Todo[]> = {};
        for (const course of courses) {
          const todoRef = CollectionOf<Todolist.Todo>(`users/${auth.authUser?.uid ?? 'default-uid'}/todos`);
          const todoSnapshot = await todoRef.get();
          todoData[course.id] = todoSnapshot.docs.map(doc => doc.data() as Todolist.Todo);
        }
        setTodoByCourse(todoData);
      };
      fetchTodo();
    }
  }, [courses]);

  // Set loading state based on course and user data
  useEffect(() => {
    if (courses.length > 0 && myCourses.length > 0) {
      setLoading(false);
    }
  }, [courses, myCourses]);

  // Filter user's courses from the full list of courses
  const myCourseIds = myCourses.map(course => course.id);
  const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));
  const { height } = Dimensions.get('window');

  // Add more pages for infinite scrolling
  const loadMorePages = () => {
    setPages((prevPages) => [...prevPages, prevPages[prevPages.length - 1] + 1]);
  };

  // Calculate date based on page offset
  const getDateWithOffset = (offset: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  };

  return (
    <TView mt={35}>
      <RouteHeader disabled={true} title='Calendar' right={<HeaderButtons>
        <HeaderButton onPress={() => router.push("/notifications" as any)} icon='notifications-outline' />
      </HeaderButtons>} />
      <TView>
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
                  <View style={{ width: windowWidth, height: height }}>
                    <Animated.View style={{ height }}>
                      <Calendar
                        courses={filteredCourses}
                        assignments={filteredCourses.flatMap(course => (assignmentsByCourse[course.id] || []).map(assignment => ({ id: course.id, data: assignment })))}
                        todos={filteredCourses.flatMap(course => (todoByCourse[course.id] || []).map(todo => ({ id: course.id, data: todo })))}
                        type={undefined}
                        date={currentDate} />
                    </Animated.View>
                  </View>
                );
              }} />

          </>
        )}
      </TView>
    </TView>
  );
}
export default InfinitePaginatedCounterScreen;
