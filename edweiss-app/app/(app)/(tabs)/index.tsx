import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import TText from '@/components/core/TText';
import { Course, courseColors } from '@/model/school/courses';

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import For from '@/components/core/For';
import { CollectionOf } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';

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

const Calendar = ({ courses }: { courses: Course[]; }) => {
	const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
	const scrollViewRef = useRef<ScrollView>(null);

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
			<TouchableOpacity
				style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderColor: 'yellow', borderWidth: 2 }}
				onPress={() => scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 0.8) * HOUR_BLOCK_HEIGHT, animated: true })}
			>
				<TText color='yellow' align='center'>now</TText>
			</TouchableOpacity>
			<ScrollView
				ref={scrollViewRef}
				style={{ flex: 1 }}
				showsVerticalScrollIndicator={true}
			>
				<TView flex={1}>
					{Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
						<><TView pl={10} pr={10} style={{
							height: HOUR_BLOCK_HEIGHT,
							borderBottomWidth: 1,
							borderBottomColor: 'lightgray',
						}} flexDirection="row">
							<TText color='text' size={12} mr={5} mt={35} style={{ width: 40 }}>{`${hour}:00`}</TText>
							<TView flexDirection="row" flex={1}>
								<For each={courses}>
									{course =>
										course.periods
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
														flex={1 / filteredPeriods.length}
														borderColor="overlay2"
														radius={10}
														b={2}
														p={2}
														style={{
															backgroundColor:
																courseColors[period.type as keyof typeof courseColors] || "white",
															height: Math.max(periodHeight, HOUR_BLOCK_HEIGHT),
														}}
													>
														<TView flexDirection="column">
															<TView flexDirection="row" justifyContent="space-between">
																<TText color="subtext1" numberOfLines={1} size={15} p={5}>
																	{`${period.type.charAt(0).toUpperCase() + period.type.slice(1)}`}
																</TText>
																<TText pr={10} pt={7} color="overlay2" numberOfLines={1} size={12}>
																	{`${period.rooms.join(", ")}`}
																</TText>
															</TView>
															<TText pl={5} color="overlay2" numberOfLines={1} size={12}>
																{`${course.name}`}
															</TText>
															<TView flexDirection="row">
																<TText p={5} size={12} color="overlay2">
																	{`${formatTime(period.start)} - ${formatTime(period.end)}`}
																</TText>
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
				</TView>
			</ScrollView>
		</TView>
	);
};

const HomeTab = () => {
	const auth = useAuth();
	const courses = useDynamicDocs(CollectionOf<Course>("courses")) ?? [];
	const my_courses = useDynamicDocs(CollectionOf<Course>("users/" + auth.authUser.uid + "/courses")) ?? [];
	const myCourseIds = my_courses.map(course => course.id);
	const filteredCourses = courses.filter(course => myCourseIds.includes(course.id));
	const periods = filteredCourses.flatMap(course => course.data);

	return (
		<TView flex={1} p={16} backgroundColor='base'>
			<Calendar courses={periods} />
			<TScrollView flex={1} horizontal={false} showsVerticalScrollIndicator={true}>
				<TText align='center'>List of courses</TText>
				<For each={filteredCourses}>
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

