
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import React from 'react';
import { Calendar } from 'react-native-calendars';

export const MyCalendar = () => {

  const auth = useAuth();
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

  const myCourseIds = my_courses.map(course => course.id);
  const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));

  return (
    <><RouteHeader disabled />
      <TView flex={1} p={16} backgroundColor='base'>
        <Calendar courses={filteredCourses} type={undefined} />
      </TView>
    </>
  );
};
export default MyCalendar;
