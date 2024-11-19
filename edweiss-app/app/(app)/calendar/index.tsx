import { Calendar } from '@/components/core/calendar';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, FlatList, View } from 'react-native';
const InfinitePaginatedCounterScreen = () => {
  const auth = useAuth();
  const [loading, setLoading] = useState(true);
  const [pages, setPages] = useState(Array.from({ length: 10 }, (_, index) => index - 3)); // De -7 à +7
  const scrollRef = useRef<FlatList>(null);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  // Écouteur global pour les changements de dimensions
  useEffect(() => {
    const handleResize = ({ window }: { window: { width: number; height: number; scale: number; fontScale: number } }) => setDimensions(window);
    const subscription = Dimensions.addEventListener('change', handleResize);
    return () => subscription?.remove();
  }, []);

  // Chargement des cours et des tâches
  const myCourses = useDynamicDocs(
    CollectionOf(`users/${auth.authUser?.uid ?? 'default-uid'}/courses`)
  )?.map(doc => ({ id: doc.id, data: doc.data })) ?? [];

  const courses = useDynamicDocs(CollectionOf('courses'))?.map(doc => ({
    id: doc.id,
    data: doc.data as unknown as Course
  })) ?? [];

  const [assignmentsByCourse, setAssignmentsByCourse] = useState<{ [key: string]: any[] }>({});
  const [todoByCourse, setTodoByCourse] = useState<{ [key: string]: any[] }>({});

  // Récupération des affectations et des tâches
  useEffect(() => {
    const fetchData = async () => {
      const assignmentsData: { [key: string]: any[] } = {};
      const todoData: { [key: string]: any[] } = {};

      for (const course of courses) {
        const assignmentsRef = CollectionOf(`courses/${course.id}/assignments`);
        const todoRef = CollectionOf(`users/${auth.authUser?.uid ?? 'default-uid'}/todos`);

        const [assignmentsSnapshot, todoSnapshot] = await Promise.all([
          assignmentsRef.get(),
          todoRef.get(),
        ]);

        assignmentsData[course.id] = assignmentsSnapshot.docs.map(doc => doc.data());
        todoData[course.id] = todoSnapshot.docs.map(doc => doc.data());
      }

      setAssignmentsByCourse(assignmentsData);
      setTodoByCourse(todoData);
      setLoading(false);
    };

    if (courses.length > 0) {
      fetchData();
    }
  }, [courses]);

  const myCourseIds = myCourses.map(course => course.id);
  const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));

  // Ajouter des pages supplémentaires pour le défilement infini
  const loadMorePages = () => {
    setPages(prevPages => [...prevPages, prevPages[prevPages.length - 1] + 1]);
  };

  // Calculer la date en fonction de l'offset
  const getDateWithOffset = (offset: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + offset);
    return date;
  };

  // Mémoïsation du rendu de chaque élément
  const renderItem = ({ item }: { item: number }) => {
    const { width, height } = dimensions;
    const adjustedItem = width > height ? item * 7 : item;
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
              assignments={filteredCourses.flatMap(course =>
                (assignmentsByCourse[course.id] || []).map(assignment => ({
                  id: course.id,
                  data: assignment,
                }))
              )}
              todos={filteredCourses.flatMap(course =>
                (todoByCourse[course.id] || []).map(todo => ({
                  id: course.id,
                  data: todo,
                }))
              )}
              type={undefined}
              date={currentDate}
            />
          </Animated.View>
        )}
      </View>
    );
  };

  return (
    <TView>
      <RouteHeader
        disabled={true}
        title="Calendar"
      />
      <TView>
        <FlatList
          initialScrollIndex={3}
          ref={scrollRef}
          data={pages}
          horizontal
          pagingEnabled
          keyExtractor={item => item.toString()}
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
