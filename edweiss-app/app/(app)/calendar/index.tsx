import { Calendar } from '@/components/core/calendar';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
<<<<<<< Updated upstream
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, ScaledSize, View } from 'react-native';
export type CourseWithId = Course & { id: string };

const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));
=======
import { Course, CourseTimePeriod } from '@/model/school/courses';
import { CustomEvents } from '@/model/school/Events';
import { AppUser } from '@/model/users';
import { getDocs, Timestamp } from '@react-native-firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, useWindowDimensions } from 'react-native';
import HorizontalCalendar from './horizontalCalendar'; // Import HorizontalCalendar
import VerticalCalendar from './VerticalCalendar';

export interface EventsByDate {
  [key: string]: CustomEvents[];
}

// Function to get navigation details based on user type and course information
export const getNavigationDetails = (user: AppUser, courseItem: { id: string; data: Course }, period: CourseTimePeriod, index: number) => {
  const isProfessor = user.type === 'professor';
  return {
    pathname: isProfessor ? '/(app)/startCourseScreen' : '/(app)/lectures/slides',
    params: isProfessor
      ? {
        courseID: courseItem.id,
        course: JSON.stringify(courseItem.data),
        period: JSON.stringify(period),
        index,
      }
      : {
        courseNameString: courseItem.data.name,
        lectureIdString: period.activityId,
      },
  };
};

const HOUR_BLOCK_HEIGHT = 80; // Height of an hour block

const EventsPerDayScreen = () => {
  const [isPortrait, setIsPortrait] = useState(true); // State to track orientation
  const [loading, setLoading] = useState(true); // State to track loading status
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: CustomEvents[] }>({}); // State to store events by date
  const auth = useAuth(); // Get authentication context
  const authUserId = auth.authUser?.uid; // Get authenticated user ID
  const { width, height } = useWindowDimensions(); // Get window dimensions
  const date = new Date(); // Current date
>>>>>>> Stashed changes

  useEffect(() => {
    const handleResize = ({ window }: { window: ScaledSize }) =>
      setDimensions(window);

    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription?.remove();
  }, []);

  return dimensions;
};

const useCourseData = (authUserId: string) => {
  const courses: CourseWithId[] = useDynamicDocs(CollectionOf('courses'))?.map(doc => ({ ...doc.data as unknown as Course, id: doc.id })) ?? [];


  const myCourses = useDynamicDocs(
    CollectionOf(`users/${authUserId}/courses`)
  )?.map((doc) => ({ id: doc.id, data: doc.data })) ?? [];

  const myCourseIds = myCourses.map((course) => course.id);
  const filteredCourses = courses.filter((course) => myCourseIds.includes(course.id));

  return { courses, filteredCourses };
};

const useAssignmentsAndTodos = (authUserId: string, courses: Course[]) => {
  const [loading, setLoading] = useState(true);
  const [assignmentsByCourse, setAssignmentsByCourse] = useState<{ [key: string]: any[] }>({});
  const [todoByCourse, setTodoByCourse] = useState<{ [key: string]: any[] }>({});

  useEffect(() => {
    const fetchData = async () => {
      if ((courses as unknown as CourseWithId[]).length === 0) return;

      try {
        const assignmentsData: { [key: string]: any[] } = {};
        const todoData: { [key: string]: any[] } = {};

        await Promise.all(
          courses.map(async (course) => {
            const assignmentsRef = CollectionOf(`courses/${(courses as unknown as CourseWithId).id}/assignments`);
            const todoRef = CollectionOf(`users/${authUserId}/todos`);

            const [assignmentsSnapshot, todoSnapshot] = await Promise.all([
              assignmentsRef.get(),
              todoRef.get(),
            ]);

            assignmentsData[(courses as unknown as CourseWithId).id] = assignmentsSnapshot.docs.map((doc) => doc.data());
            todoData[(courses as unknown as CourseWithId).id] = todoSnapshot.docs.map((doc) => doc.data());
          })
        );

        setAssignmentsByCourse(assignmentsData);
        setTodoByCourse(todoData);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données Firebase:', error);
      }
    };

    fetchData();
  }, [authUserId, courses]);

  return { loading, assignmentsByCourse, todoByCourse };
};

const InfinitePaginatedCounterScreen = () => {
  const auth = useAuth();
  const dimensions = useWindowDimensions();
  const { width, height } = dimensions;

  const { courses, filteredCourses } = useCourseData(auth.authUser?.uid ?? 'default-uid');
  const { loading, assignmentsByCourse, todoByCourse } = useAssignmentsAndTodos(
    auth.authUser?.uid ?? 'default-uid',
    courses
  );

  const [pages, setPages] = useState(Array.from({ length: 10 }, (_, index) => index - 3));
  const scrollRef = useRef<FlatList>(null);

  const todos = filteredCourses.flatMap((course) =>
    (todoByCourse[course.id] || []).map((todo) => ({ id: course.id, data: todo }))
  );

  const assignments = filteredCourses.flatMap((course) =>
    (assignmentsByCourse[course.id] || []).map((assignment) => ({
      id: course.id,
      data: assignment,
    }))
  );

  const loadMorePages = () => {
    setPages((prevPages) => [...prevPages, prevPages[prevPages.length - 1] + 1]);
  };

  const getDateWithOffset = (offset: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  };

  const renderItem = ({ item }: { item: number }) => {
    const adjustedItem = width > height ? item * 7 : item; // Mode paysage ou portrait
    const currentDate = getDateWithOffset(adjustedItem);


    return (
      <View style={{ width, height }}>
        {loading ? (
          <View style={{ justifyContent: 'center', alignItems: 'center', height }}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <Animated.View style={{ height }}>
            <Calendar
              courses={filteredCourses.map(course => ({ id: course.id, data: course }))}
              assignments={assignments}
              todos={todos}
              date={currentDate}
              type={undefined}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <TView>
      <RouteHeader title="Calendar" disabled />
      <TView>
        <FlatList
          initialScrollIndex={3}
          ref={scrollRef}
          data={pages}
          horizontal
          pagingEnabled
          keyExtractor={(item) => item.toString()}
          onEndReached={loadMorePages}
          onEndReachedThreshold={0.1}
          showsHorizontalScrollIndicator={false}
          renderItem={renderItem}
          getItemLayout={(_, index) => ({
            length: dimensions.width,
            offset: dimensions.width * index,
            index,
          })}
        />
      </TView>
    </TView>
  );
};

export default InfinitePaginatedCounterScreen;
