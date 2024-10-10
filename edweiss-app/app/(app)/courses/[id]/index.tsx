import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';
import { Course } from '@/model/school/courses';
import { firebase } from '@react-native-firebase/auth';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';

const CoursePage: ApplicationRoute = () => {
	const { id } = useLocalSearchParams();

	if (typeof id !== 'string') return <Redirect href={'/'} />;

	const [course, setCourse] = useState<Course | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCourse = async () => {
			try {
				const doc = await firebase.firestore().collection('courses').doc(id).get();
				if (doc.exists) {
					const courseData = doc.data() as Course;
					setCourse(courseData);
				} else {
					console.log('No such document!');
				}
			} catch (error) {
				console.error("Error fetching course: ", error);
			} finally {
				setLoading(false);
			}
		};

		fetchCourse();
	}, [id]);

	if (loading) return <TActivityIndicator size={40} />;

	if (!course) return <TText>No course found</TText>;

	return (
		<>
			<RouteHeader title={course.name} />
			<TView>
				<TText>Course name: {course.name}</TText>
			</TView>
		</>
	);
};

export default CoursePage;
