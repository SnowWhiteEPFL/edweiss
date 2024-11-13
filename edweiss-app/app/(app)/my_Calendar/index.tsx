import { Calendar } from '@/components/core/calendar';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import React from 'react';

const useFetchCourses = (collectionPath: string) => {
  return useDynamicDocs(CollectionOf<Course>(collectionPath))?.map(doc => ({
    id: doc.id,
    data: doc.data
  })) ?? [];
};

export const MyCalendar = () => {
  const auth = useAuth();
  const courses = useFetchCourses("courses");
  const my_courses = useFetchCourses("users/" + (auth.authUser?.uid ?? 'default-uid') + "/courses");

  const myCourseIds = my_courses.map(course => course.id);
  const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));

  return (
    <>
      <RouteHeader disabled />
      <TView flex={1} p={16} backgroundColor='base'>
        <Calendar courses={filteredCourses} type={undefined} date={new Date()} />
      </TView>
    </>
  );
};

export default MyCalendar;
