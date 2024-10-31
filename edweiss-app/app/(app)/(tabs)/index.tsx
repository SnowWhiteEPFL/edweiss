


import { Calendar } from '@/components/core/calendar';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import TText from '@/components/core/TText';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course } from '@/model/school/courses';
import { router } from 'expo-router';
import React from 'react';

const HomeTab = () => {
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
		<TView flex={1} p={16} backgroundColor='base'>
			<TTouchableOpacity radius={10} p={5}
				style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderWidth: 2, borderColor: 'pink' }}
				onPress={() => router.push("/(app)/my_Calendar")}>
				<TText align='center'>My Calendar</TText>
			</TTouchableOpacity>
			<Calendar courses={filteredCourses} type={'day'} />
			<TScrollView flex={1} horizontal={false} showsVerticalScrollIndicator={true}>
				<TText align='center'>List of courses</TText>
				<For each={filteredCourses} key="id">
					{course =>
						<TTouchableOpacity onPress={() => router.push(`/(app)/courses/${course.id}`)} b={2} radius={10} flexDirection='row' p={5} borderColor='overlay2' backgroundColor='surface0' mb={8} >
							<TView flexDirection='column'>
								<TView flexDirection='row'>
									<TText color='subtext1' p={10}>{course.data.name}</TText>
									{course.data.newAssignments && <TText color='green' pt={10} pb={0} size={25}>New!</TText>}
								</TView>
								<TView p={5} flexDirection='row'>
									<TText p={5} pr={70}>Crédits: {course.data.credits}</TText>
									<TView >
										{course.data.assignments &&
											<TView borderColor='red' radius={3} >
												{course.data.assignments.length > 0 && <TText color='subtext1' p={10} >assignements : {course.data.assignments.length}</TText>}
											</TView>
										}
									</TView>
								</TView>
							</TView>
						</TTouchableOpacity>
					}
				</For>
			</TScrollView>
		</TView>
	);
};

export default HomeTab;
