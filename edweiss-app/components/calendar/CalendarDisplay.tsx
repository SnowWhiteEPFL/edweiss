import { Document } from '@/config/firebase';
import { Course } from '@/model/school/courses';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import For from '../core/For';
import TView from '../core/containers/TView';

import { useUser } from '@/contexts/user';
import { Time } from '@/utils/time';
import TText from '../core/TText';
import CalendarDayDisplay from './CalendarDayDisplay';

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 24;

const CalendarDisplay = ({ courses }: { courses: Document<Course>[]; }) => {
	const [currentMinutes, setCurrentMinutes] = useState(Time.getCurrentTimeInMinutes());
	const scrollViewRef = useRef<ScrollView>(null);
	const { user } = useUser();

	useEffect(() => {
		const interval = setInterval(() => { setCurrentMinutes(Time.getCurrentTimeInMinutes()); }, 60000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
	}, []);

	return (
		<TView flex={1}>
			<TView backgroundColor='crust' py={"md"}>
				<TText align='center' size={'md'}>jeudi 11 novembre</TText>
			</TView>

			<ScrollView ref={scrollViewRef} style={{ flex: 1 }}>
				{[...Array(TOTAL_HOURS).keys()].map(hour => (
					<>
						<TView key={hour} pr={10} borderColor='crust' bb={1} style={{
							height: HOUR_BLOCK_HEIGHT
						}} flexDirection="row">
							<TView backgroundColor='crust' style={{ width: 60 }}>
								<TText color='text' pl={"sm"} pr={"sm"} size={"xs"} mr={5} mt={35} align='center'>{`${hour}:00`}</TText>
							</TView>

							<TView flexDirection="row" flex={1}>
								<For each={courses}>
									{course =>
										course.data.periods
											.filter(
												period =>
													period.start >= hour * 60 &&
													period.start < (hour + 1) * 60 &&
													period.dayIndex === Time.getCurrentDay()
											)
											.map((period, index, filteredPeriods) => {
												return (
													<CalendarDayDisplay
														key={index}
														period={period}
														course={course}
														user={user}
														filteredPeriods={filteredPeriods}
														index={index}
													/>
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

// const CalendarDisplay = ({ courses }: { courses: Document<Course>[]; }) => {
// 	const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
// 	const scrollViewRef = useRef<ScrollView>(null);
// 	const [user, setUser] = useState<any>(null);
// 	const userId = useAuth().uid;

// 	useEffect(() => {
// 		const fetchUser = async () => {
// 			const userData = await getDocument(Collections.users, userId);
// 			setUser(userData);
// 		};
// 		fetchUser();
// 	}, [userId]);

// 	useEffect(() => {
// 		const interval = setInterval(() => { setCurrentMinutes(getCurrentTimeInMinutes()); }, 60000);
// 		return () => clearInterval(interval);
// 	}, []);

// 	useEffect(() => {
// 		scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 1) * HOUR_BLOCK_HEIGHT, animated: true });
// 	}, []);

// 	return (
// 		<TView mb={16} flex={1} key={userId}>
// 			<TText align='center'>My Calendar</TText>
// 			<TTouchableOpacity borderColor='yellow' b={2} radius={10} p={5}
// 				style={{ marginVertical: 8, width: '100%', borderRadius: 10, borderWidth: 2 }}
// 				onPress={() => scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 0.8) * HOUR_BLOCK_HEIGHT, animated: true })}
// 			>
// 				<TText color='yellow' align='center'>now</TText>
// 			</TTouchableOpacity>
// 			<ScrollView
// 				ref={scrollViewRef}
// 				style={{ flex: 1 }}
// 				showsVerticalScrollIndicator={true}
// 			>

// 				{Array.from({ length: TOTAL_HOURS }).map((_, hour) => (
// 					<><TView key={hour} pl={10} pr={10} style={{
// 						height: HOUR_BLOCK_HEIGHT,
// 						borderBottomWidth: 1,
// 					}} flexDirection="row">
// 						<TText color='text' size={12} mr={5} mt={35} style={{ width: 40 }}>{`${hour}:00`}</TText>
// 						<TView flexDirection="row" flex={1}>
// 							<For each={courses} key="id">
// 								{course =>
// 									course.data.periods
// 										.filter(
// 											period =>
// 												period.start >= hour * 60 &&
// 												period.start < (hour + 1) * 60 &&
// 												period.dayIndex === getCurrentDay()
// 										)
// 										.map((period, index, filteredPeriods) => {
// 											return (
// 												<Day
// 													key={index}
// 													period={period}
// 													course={course}
// 													user={user}
// 													filteredPeriods={filteredPeriods}
// 													index={index}
// 												/>

// 											);
// 										})
// 								}
// 							</For>
// 						</TView>
// 					</TView>
// 						<TView
// 							backgroundColor='red'
// 							style={{
// 								position: 'absolute',
// 								width: '100%',
// 								height: 2,
// 								top: (currentMinutes / 60) * HOUR_BLOCK_HEIGHT,
// 							}}
// 						/>
// 					</>
// 				))}
// 			</ScrollView>
// 		</TView>

// 	);
// };

export default CalendarDisplay;