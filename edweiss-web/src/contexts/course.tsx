import { CollectionOf } from '@/config/firebase';
import { useDoc } from '@/hooks/firestore';
import { Course, CourseID } from '@/model/school/courses';
import React, { useContext } from "react";
import { Navigate, useParams } from 'react-router-dom';

interface CourseInterface {
	courseId: CourseID,
	course: Course;
}

const CourseContext = React.createContext<CourseInterface>({} as any);

export function useCourse() {
	return useContext(CourseContext);
}

export function CourseProvider({ children }: any) {
	const { id } = useParams();
	if (id == undefined)
		return <Navigate to={"/"} />;

	const course = useDoc(CollectionOf<Course>("courses"), id);
	if (course == undefined)
		return <div>Loading course</div>;

	const value: CourseInterface = {
		courseId: id,
		course: course as any as Course
	};

	return (
		<CourseContext.Provider value={value}>
			{children}
		</CourseContext.Provider>
	);
}