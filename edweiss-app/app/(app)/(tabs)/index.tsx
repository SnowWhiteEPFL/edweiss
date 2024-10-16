import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import TText from '@/components/core/TText';
import { CollectionOf, Collections, getDocument } from '@/config/firebase';
import { Color } from '@/constants/Colors';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { Course, courseColors } from '@/model/school/courses';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native';


const getCurrentTimeInMinutes = () => {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
};
const getCurrentDay = () => {
	const now = new Date();
	return now.getDay();
};

const formatTime = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 24;

const Calendar = ({ courses }: { courses: { id: string; data: Course; }[]; }) => {
	const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
	const scrollViewRef = useRef<ScrollView>(null);
	const [user, setUser] = useState<any>(null);
	const userId = useAuth().uid;

	useEffect(() => {
		const fetchUser = async () => {
			const userData = await getDocument(Collections.users, userId);
			setUser(userData);
		};
		fetchUser();
	}, [userId]);
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentMinutes(getCurrentTimeInMinutes());
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
	}, []);

	return (
		<TView mb={16} flex={1}>
			<TText align='center'>My Calendar</TText>
			<TTouchableOpacity borderColor='yellow' b={2} radius={10} p={5}
				style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderWidth: 2 }}
				onPress={() => scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 0.8) * HOUR_BLOCK_HEIGHT, animated: true })}
			>
				<TText color='yellow' align='center'>now</TText>
			</TTouchableOpacity>
			<ScrollView key={currentMinutes}
				ref={scrollViewRef}
				style={{ flex: 1 }}
				showsVerticalScrollIndicator={true}
			>

				{Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
					<><TView key={hour} pl={10} pr={10} style={{
						height: HOUR_BLOCK_HEIGHT,
						borderBottomWidth: 1,
					}} flexDirection="row">
						<TText color='text' size={12} mr={5} mt={35} style={{ width: 40 }}>{`${hour}:00`}</TText>
						<TView flexDirection="row" flex={1}>
							<For each={courses} key="id">
								{course =>
									course.data.periods
										.filter(
											period =>
												period.start >= hour * 60 &&
												period.start < (hour + 1) * 60 &&
												period.dayIndex === getCurrentDay()
										)
										.map((period, index, filteredPeriods) => {
											const periodHeight =
												((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT;

											return (

												<TView
													key={index}
													flex={1 / filteredPeriods.length}
													borderColor="overlay2"
													radius={10}
													b={2}
													p={2}
													backgroundColor={courseColors[period.type] as Color || 'base'}
													style={{
														height: periodHeight
													}}
												>
													<TView flexDirection="column">
														<TView flexDirection="row" justifyContent="space-between">
															<TText color="title" numberOfLines={1} size={15} p={5}>
																{`${period.type.charAt(0).toUpperCase() + period.type.slice(1)}`}
															</TText>
															<TText pr={10} pt={7} color="overlay2" numberOfLines={1} size={12}>
																{`${period.rooms.join(", ")}`}
															</TText>
														</TView>
														<TText pl={5} color="overlay2" numberOfLines={1} size={12}>
															{`${course.data.name}`}
														</TText>
														<TView flexDirection="row">
															<TText p={5} size={12} color="overlay2">
																{`${formatTime(period.start)} - ${formatTime(period.end)}`}
															</TText>
															{user.data.type == 'student' && course.data.started && period.type == 'lecture' && <TText p={5} onPress={() => router.push(`/(app)/test_showTime`)} size={15} color="red">Join Course</TText>}
															{user.data.type == 'professor' && period.type == 'lecture' && <TText p={5} onPress={() => router.push({
																pathname: '/(app)/startCourseScreen',
																params: {
																	courseID: course.id, course: JSON.stringify(course.data),
																}
															})} size={15} color="red">{(course.data.started == false && "Start Course") || (course.data.started == true && "Stop Course")}</TText>}
														</TView>
													</TView>
												</TView>
											);
										})
								}
							</For>
						</TView>
					</TView>
						<TView
							backgroundColor='red'
							style={{
								position: 'absolute',
								width: '100%',
								height: 2,
								top: (currentMinutes / 60) * HOUR_BLOCK_HEIGHT,
							}}
						/>
					</>
				))}
			</ScrollView>
		</TView>

	);
};

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
			<Calendar courses={filteredCourses} />
			<TScrollView flex={1} horizontal={false} showsVerticalScrollIndicator={true}>
				<TText align='center'>List of courses</TText>
				<For each={filteredCourses} key="id">
					{course =>
						<TTouchableOpacity onPress={() => router.push(`/(app)/courses/${course.id}`)} b={2} radius={10} flexDirection='row' p={5} borderColor='overlay2' backgroundColor='surface0' mb={8} >
							<TView flexDirection='column'>
								<TView flexDirection='row'>
									<TText color='subtext1' p={10}>{course.data.name}</TText>
									{course.data.newAssignments && <TText color='red' pt={10} pb={0} size={25}>New!</TText>}
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

