import { Calendar } from '@/components/core/calendar';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, ScaledSize, View } from 'react-native';

const InfinitePaginatedCounterScreen = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(Array.from({ length: 10 }, (_, index) => index - 3));
  const scrollRef = useRef<FlatList>(null);
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  // Gestion des dimensions avec un abonnement global
  useEffect(() => {
    const handleResize = ({ window }: { window: ScaledSize }) =>
      setDimensions(window);

    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription?.remove();
  }, []);

  // Chargement des données des cours
  const myCourses = useDynamicDocs(
    CollectionOf(`users/${auth.authUser?.uid ?? 'default-uid'}/courses`)
  )?.map((doc) => ({ id: doc.id, data: doc.data })) ?? [];

  const courses = useDynamicDocs(CollectionOf('courses'))?.map((doc) => ({
    id: doc.id,
    data: doc.data as unknown as Course,
  })) ?? [];

  // Gestion des tâches et des devoirs par cours
  const [assignmentsByCourse, setAssignmentsByCourse] = useState<{ [key: string]: any[] }>({});
  const [todoByCourse, setTodoByCourse] = useState<{ [key: string]: any[] }>({});
  const { width, height } = dimensions;
  useEffect(() => {
    const fetchData = async () => {
      if (courses.length === 0) return;

      try {
        const assignmentsData: { [key: string]: any[] } = {};
        const todoData: { [key: string]: any[] } = {};

        await Promise.all(
          courses.map(async (course) => {
            const assignmentsRef = CollectionOf(`courses/${course.id}/assignments`);
            const todoRef = CollectionOf(`users/${auth.authUser?.uid ?? 'default-uid'}/todos`);

            const [assignmentsSnapshot, todoSnapshot] = await Promise.all([
              assignmentsRef.get(),
              todoRef.get(),
            ]);

            assignmentsData[course.id] = assignmentsSnapshot.docs.map((doc) => doc.data());
            todoData[course.id] = todoSnapshot.docs.map((doc) => doc.data());
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
  }, [courses]);

  const myCourseIds = myCourses.map((course) => course.id);
  const filteredCourses = courses.filter((course) => myCourseIds.includes(course.id));
  const todos = filteredCourses.flatMap((course) => (todoByCourse[course.id] || []).map((todo) => ({
    id: course.id,
    data: todo,
  })))
  const assignments = filteredCourses.flatMap((course) => (assignmentsByCourse[course.id] || []).map((assignment) => ({
    id: course.id,
    data: assignment,
  })))
  // Ajout de nouvelles pages pour le défilement infini
  const loadMorePages = () => {
    setPages((prevPages) => [...prevPages, prevPages[prevPages.length - 1] + 1]);
  };

  // Calcul de la date avec un décalage
  const getDateWithOffset = (offset: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  };

  // Rendu des items de la liste
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
              courses={filteredCourses}
              assignments={assignments}
              todos={todos}
              date={currentDate}
              type={undefined} />
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
