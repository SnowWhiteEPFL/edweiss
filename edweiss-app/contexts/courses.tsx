import { CollectionOf, Document } from '@/config/firebase'
import { useDocsWithIds } from '@/hooks/firebase/firestore'
import { Course, CourseID } from '@/model/school/courses'
import React, { useContext } from 'react'
import { useUser } from './user'

type CourseInterface = Document<Course>[] | undefined

const CourseContext = React.createContext<CourseInterface>(undefined)

export function useCourses() {
	return useContext(CourseContext)
}

export function useCourse(id: CourseID): Document<Course> | undefined {
	const courses = useCourses();

	if (courses == undefined)
		return undefined;

	return courses.filter(c => c.id == id)[0];
}

export function CoursesProvider(props: React.PropsWithChildren) {
	const { user } = useUser();

	const courses = useDocsWithIds(CollectionOf<Course>("courses"), user.courses ?? []);

	return (
		<CourseContext.Provider value={courses}>
			{props.children}
		</CourseContext.Provider>
	)
}
