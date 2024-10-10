import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
<<<<<<< HEAD
import TText from '@/components/core/TText';
import { Course } from '@/model/school/courses';
import { firebase } from '@react-native-firebase/auth';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import For from '@/components/core/For';
import { CollectionOf } from '@/config/firebase';
import ReactComponent from '@/constants/Component';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, TouchableOpacity } from 'react-native';
=======
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { Collections, callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router } from 'expo-router';
import React, { useState } from 'react';
>>>>>>> 6e7f49d3f468f46252eea352fca5a2ed96f357ac

const courses: Course[] = [
	{
		name: "Responsible software",
		description: "description",
		periods: [
			{
				type: "lecture",
				dayIndex: 0,
				start: 495,
				end: 600,
				rooms: [{ name: "ARCHI", geoloc: { latitude: 0, longitude: 0 } }],
			},
		],
		section: "IN",
		credits: 3,
		professors: ["Cecile Hardebolle"],
		assistants: [],
		assignements: [{
			name: "Quiz 1", type: "quiz",
			dueDate: firebase.firestore.Timestamp.fromDate(new Date("2022-10-01T23:59:59Z")),
		}, {
			name: "Quiz 2",
			type: 'quiz',
			dueDate: firebase.firestore.Timestamp.fromDate(new Date("1970-01-01T00:00:00Z"))
		}, {
			name: "Quiz 3",
			type: 'quiz',
			dueDate: firebase.firestore.Timestamp.fromDate(new Date("1970-01-01T00:00:00Z"))
		}],
		newAssignments: true
	},
	{
		name: "Modèles stochastiques pour les communications",
		description: "description",
		periods: [
			{
				type: "lecture",
				dayIndex: 0,
				start: 615,
				end: 720,
				rooms: [{ name: "CM 13", geoloc: { latitude: 0, longitude: 0 } }],
			},
			{
				type: "exercises",
				dayIndex: 0,
				start: 735,
				end: 780,
				rooms: [{ name: "CM 13", geoloc: { latitude: 0, longitude: 0 } }],
			},
		],
		section: "IN",
		credits: 5,
		professors: ["Patrick Thiran"],
		assistants: [],
		assignements: [],
		newAssignments: false
	},
	{
		name: "SHS",
		description: "Physique et philosophie du XXe siècle",
		periods: [
			{
				type: "lecture",
				dayIndex: 0,
				start: 795, // 9:00 AM
				end: 900, // 10:30 AM
				rooms: [{ name: "room1", geoloc: { latitude: 0, longitude: 0 } }],
			},
			{
				type: "lecture",
				dayIndex: 0,
				start: 615, // 9:00 AM
				end: 700, // 10:30 AM
				rooms: [{ name: "room1", geoloc: { latitude: 0, longitude: 0 } }],
			},
		],
		section: "IN",
		credits: 2,
		professors: ["Michael-Andreas Esfeld"],
		assistants: [],
		assignements: [{
			name: "Quiz 1",
			type: 'quiz',
			dueDate: firebase.firestore.Timestamp.fromDate(new Date("1970-01-01T00:00:00Z"))
		}],
		newAssignments: false
	},
	{
		name: "Computer security and privacy",
		description: "description",
		periods: [
			{
				type: "lecture",
				dayIndex: 1,
				start: 915, // 12:00 PM
				end: 1020, // 1:00 PM
				rooms: [{ name: "CE 13", geoloc: { latitude: 0, longitude: 0 } }],
			},
		],
		section: "IN",
		credits: 5,
		professors: [],
		assistants: [],
		assignements: [],
		newAssignments: false
	},
];
const courseColors = {
	lecture: 'lightblue',
	exercises: 'lightgreen',
	lab: 'lightyellow',
	project: 'lightcoral',
};

const getCurrentTimeInMinutes = () => {
	const now = new Date();
	return now.getHours() * 60 + now.getMinutes();
};

const formatTime = (minutes: number) => {
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
};

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 24;

const Calendar = ({ cyclicPeriods }: { cyclicPeriods: { type: string; dayIndex: number; start: number; end: number; rooms: { name: string; geoloc: { latitude: number; longitude: number; }; }[]; name: string; }[]; }) => {
	const [currentMinutes, setCurrentMinutes] = useState(getCurrentTimeInMinutes());
	const scrollViewRef = useRef<ScrollView>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentMinutes(getCurrentTimeInMinutes());
		}, 60000);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		scrollViewRef.current?.scrollTo({ y: (currentMinutes / 60 - 0.8) * HOUR_BLOCK_HEIGHT, animated: true });
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
						<TView key={hour} pl={10} pr={10} style={{
							height: HOUR_BLOCK_HEIGHT,
							borderBottomWidth: 1,
							borderBottomColor: 'lightgray',
						}} flexDirection="row">
							<TText color='text' size={12} mr={5} mt={35} style={{ width: 40 }}>{`${hour}:00`}</TText>
							<TView flexDirection='row' flex={1}>
								{cyclicPeriods.filter(
									(period) =>
										(period.start >= hour * 60 && period.start < (hour + 1) * 60) || (period.end > hour * 60 && period.end <= (hour + 1) * 60)
								).map((period, index, filteredPeriods) => {
									const periodHeight =
										((period.end - period.start) / 60) * (HOUR_BLOCK_HEIGHT * 0.5);

									return (
										<TView
											key={index}
											flex={1 / filteredPeriods.length}
											borderColor="overlay2"
											radius={10}
											b={2}
											p={2}
											style={{
												backgroundColor: courseColors[period.type as keyof typeof courseColors] || "white",
												height: Math.max(periodHeight, 80),
											}}
										>
											<TView flexDirection="column">
												<TView flexDirection="row" justifyContent="space-between">
													<TText color="surface0" numberOfLines={1} p={5} style={{ fontSize: 15, lineHeight: 16 }}>
														{`${period.type.charAt(0).toUpperCase() + period.type.slice(1)}`}</TText>
													<TText pr={10} pt={7} color="overlay2" numberOfLines={1} size={12}>
														{`${period.rooms.map((room) => room.name).join(", ")}`}
													</TText>
												</TView>
												<TText pl={5} color="overlay2" numberOfLines={1} size={12}>
													{`${period.name}`}
												</TText>
												<TView flexDirection="row">
													<TText p={5} size={12} color="overlay2">
														{`${formatTime(period.start)} - ${formatTime(period.end)}`}
													</TText>
												</TView>
											</TView>
										</TView>
									);
								})}
							</TView>
						</TView>

					))}
					<TView
						backgroundColor='red'
						style={{
							position: 'absolute',
							width: '100%',
							height: 2,
							top: (currentMinutes / 60) * HOUR_BLOCK_HEIGHT,
						}}
					/>
				</TView>
			</ScrollView>
		</TView>
	);
};

const HomeTab = () => {

	const [courseName, setCourseName] = useState("");
	const [courses_, setCourses] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot[]>([]);


	useEffect(() => {
		const fetchCourses = async () => {
			try {
				const cours = await CollectionOf<Course>('courses').get();
				setCourses(cours.docs);
			} catch (error) {
				console.error("Error fetching courses: ", error);
			}
		};

		fetchCourses();
	}, []);





	const cyclicPeriods = courses.flatMap(course =>
		course.periods.map(period => ({
			type: period.type,
			dayIndex: period.dayIndex,
			start: period.start,
			end: period.end,
			rooms: period.rooms,
			name: course.name
		}))
	);

	return (


		<TView flex={1} p={16} backgroundColor='base' style={{

		}}>
			<Calendar cyclicPeriods={cyclicPeriods} />
			<TScrollView flex={1} horizontal={false} showsVerticalScrollIndicator={true}>
				<TText align='center'>List of courses</TText>
				<For each={courses_.map((doc) => {
					const course = doc.data() as Course;
					return { ...course, id: doc.id };
				})}>
					{course =>
						<TTouchableOpacity onPress={() => router.push(`/(app)/courses/${course.id}`)} b={2} radius={10} flexDirection='row' p={5} borderColor='overlay2' backgroundColor='overlay0' mb={8} key={course.id}>
							<TView flexDirection='column' >
								<TView flexDirection='row' >
									<TText p={5} pb={0} pt={0} color='flamingo'>{course.name}</TText>
									{course.newAssignments && <TText color='green'>New!</TText>}
								</TView>
								<TText p={5} >{course.description}</TText>
								<TView flexDirection='row' >
									<TText p={5} pt={0}>Crédits: {course.credits}</TText>
									<TView pl={10}>
										{course.assignements?.length > 0 ? (
											<TView style={{ borderColor: 'red', borderWidth: 1, borderRadius: 10 }} >
												<TText pl={10} pr={10} >assignements : {course.assignements.length}</TText>
											</TView>
										) : null}


									</TView>
								</TView>
							</TView>

						</TTouchableOpacity>}
				</For>

			</TScrollView>
		</TView>

		/*
		<>
			<RouteHeader title={"Home"} />

			<TScrollView>
<<<<<<< HEAD
				<For each={courses_.map((doc) => {
					const course = doc.data() as Course; // Explicitly cast doc.data() to Course type
					return { ...course, id: doc.id };    // Merge course data with the document id
				})}>
					{course => <CourseDisplay key={course.id} course={course} id={course.id} />}
=======
				{/* <TextInput value={deckName} onChangeText={n => setDeckName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ backgroundColor: Colors.dark.crust, borderColor: Colors.dark.blue, borderWidth: 1, padding: 8, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'white', borderRadius: 14, fontFamily: "Inter" }}>

				</TextInput> */}

				<FancyTextInput
					value={deckName}
					onChangeText={n => setDeckName(n)}
					placeholder='My amazing deck'
					icon='dice'
					label='Deck name'
					// error='Invalid deck name'
					multiline
					numberOfLines={3}
				/>

				<FancyButton backgroundColor='blue' mt={'md'} mb={'sm'} onPress={call} icon='logo-firebase'>
					{t("memento:create-deck")}
				</FancyButton>

				<For each={decks}>
					{deck => <DeckDisplay key={deck.id} deck={deck.data} id={deck.id} />}
>>>>>>> 6e7f49d3f468f46252eea352fca5a2ed96f357ac
				</For>

			</TScrollView>
		</>
		*/
	);
};

export default HomeTab;


const CourseDisplay: ReactComponent<{ course: Course, id: string; }> = ({ course, id }) => {
	return (
		<TTouchableOpacity
			bb={0}
			onPress={() => router.push(`/(app)/courses/${id}`)}
			m='md'
			mt={'sm'}
			mb={'sm'}
			p='lg'
			backgroundColor='base'
			borderColor='crust'
			radius='lg'
		>
			<TText bold>
				{course.name}
			</TText>
<<<<<<< HEAD
=======
			<TText mb='md' color='subtext0' size={'sm'}>
				2h ago
			</TText>
			{
				deck.cards.map((card, index) => <CardDisplay key={index} card={card} />)
			}
>>>>>>> 6e7f49d3f468f46252eea352fca5a2ed96f357ac
		</TTouchableOpacity>
	);
};
