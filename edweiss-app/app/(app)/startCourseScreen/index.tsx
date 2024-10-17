import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import RouteHeader from '@/components/core/header/RouteHeader';
import TText from '@/components/core/TText';
import { callFunction } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { Course, Course_functions } from '@/model/school/courses';
import { useLocalSearchParams } from 'expo-router';

import { useState } from 'react';




const StartCourseScreen: ApplicationRoute = () => {
	const { courseID, course } = useLocalSearchParams<{ courseID: string; course: string; }>();

	const parsedCourse: Course = JSON.parse(course);
	//const [course_started, set_course] = useState((course.started && "Start course") || "Stop course");
	const [statut, setStatut] = useState("Start course");
	async function start() {
		setStatut("Stop course");
		const res = await callFunction(Course_functions.Functions.startCourse, {
			courseID, course: parsedCourse
		});
		if (res.status == 1) {
			console.log(`OKAY, course started`);
		}
	}
	async function stop() {
		setStatut("Start course");
		const res = await callFunction(Course_functions.Functions.stopCourse, {
			courseID, course: parsedCourse
		});
		if (res.status == 1) {
			console.log(`OKAY, course stopped`);
		}
	}
	return (
		<>
			<RouteHeader title={"Course gestion"} />
			{parsedCourse.started == false &&
				<TTouchableOpacity
					onPress={() => { start(); }}>
					<TText>Start course</TText>
				</TTouchableOpacity>}
			{parsedCourse.started == true &&
				<TTouchableOpacity
					onPress={() => { stop(); }}>
					<TText>Stop course</TText>
				</TTouchableOpacity>}
		</>
	);
};

export default StartCourseScreen;
