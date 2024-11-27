import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import HeaderButton from '@/components/core/header/HeaderButton';
import HeaderButtons from '@/components/core/header/HeaderButtons';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import RichText from '@/components/core/rich-text/RichText';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { CollectionOf, Document } from '@/config/firebase';
import t from '@/config/i18config';
import { Color, courseColors } from '@/constants/Colors';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useCourses } from '@/contexts/courses';
import { useDocs } from '@/hooks/firebase/firestore';
import { Assignment, Course } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { router } from 'expo-router';
import React from 'react';

const HomeTab: ApplicationRoute = () => {
	const courses = useCourses();

	if (courses == undefined)
		return <TActivityIndicator size={40} />

	return (
		<>
			<RouteHeader title='Home' right={
				<HeaderButtons>
					<HeaderButton onPress={() => router.push("/notifications" as any)} icon='notifications-outline' />
				</HeaderButtons>
			} />

			<TScrollView showsVerticalScrollIndicator={true} pt={'sm'}>
				{courses.length == 0 && <TText>Debug: You have no course registered on Firebase.</TText>}

				<Schedule courses={courses} />

				<TView flexDirection='row' mx={"md"} alignItems='center' flexColumnGap={8} mb={"sm"}>
					<Icon name='school-outline' size={18} />
					<TText>
						Courses
					</TText>
				</TView>

				<For each={courses}>
					{course => <CourseDisplay key={course.id} course={course} />}
				</For>

				<RichText>
					{"\\frac{1}{2}"}
				</RichText>

			</TScrollView>
		</>
	);
};

export default HomeTab;

const Schedule: ReactComponent<{ courses: Document<Course>[] }> = ({ courses }) => {
	return (
		<TTouchableOpacity onPress={() => router.push('/calendar')} radius={'md'} backgroundColor='transparent' mx={'md'} mb={'lg'} >
			<TView flexDirection='row' alignItems='center' flexColumnGap={8} mb={'xs'}>
				<Icon name='calendar-outline' size={18} />
				<TText>
					{t("home:schedule")}
				</TText>
			</TView>

			{
				/**
				 * Schedule point should
				 */
			}

			<SchedulePoint color={courseColors["lab"]} time='tue. 08:15' name='Responsible Software' room='CO3' />
			<SchedulePoint color={courseColors["lecture"]} time='tue. 10:15' name='Quantum Mechanics for Non-Physicists' room='INF100' />
			<SchedulePoint color={courseColors["project"]} time='wed. 13:15' name='Software Entreprise' room='ELE20' />

			{/* <TText align='center' color='subtext0' size={'sm'} mt={'sm'}>See more</TText> */}
		</TTouchableOpacity>
	);
};

const SchedulePoint: ReactComponent<{ color: Color, time: string, name: string, room: string }> = (props) => {
	return (
		<TView flexDirection='row' alignItems='center' mt={'sm'} flexColumnGap={8}>
			<TView backgroundColor={props.color} radius={'xl'} style={{ width: 10, height: 10 }}></TView>
			<TView flex={1}>
				<TText numberOfLines={1}>
					<TText light='#000' dark='#fff' size={'sm'}>
						{props.time + " "}
					</TText>
					<TText ml={"md"} size={'sm'}>
						{props.name}
					</TText>
				</TText>
			</TView>
			<TText color='subtext0' size={'sm'}>
				{props.room}
			</TText>
		</TView>
	);
};

const CourseDisplay: ReactComponent<{ course: Document<Course> }> = ({ course }) => {
	const assignments = useDocs(CollectionOf<Assignment>(`courses/${course.id}/assignments`));

	return (
		<TTouchableOpacity onPress={() => router.push(`/courses/${course.id}`)} radius={'md'} backgroundColor='base' mx={'md'} p={'md'} mb={"md"}>
			<TText>
				{course.data.name}
			</TText>
			<For each={assignments}>
				{assignment => <AssignmentDisplay key={assignment.id} assignment={assignment} />}
			</For>
			<TText size={'sm'} color='overlay1'>
				{t("home:no_assignments")}
			</TText>
		</TTouchableOpacity>
		// <TTouchableOpacity onPress={() => router.push(`/courses/${course.id}`)} radius={'md'} flexDirection='row' p={5} borderColor='overlay2' backgroundColor='surface0' mb={8} >
		// 	<TView flexDirection='column'>
		// 		<TView flexDirection='row'>
		// 			<TText color='subtext1' p={10}>{course.data.name}</TText>
		// 			{course.data.newAssignments && <TText color='green' pt={10} pb={0} size={25}>New!</TText>}
		// 		</TView>
		// 		<TView p={5} flexDirection='row'>
		// 			<TText p={5} pr={70}>Crédits: {course.data.credits}</TText>
		// 			<TView >
		// 				{course.data.assignments &&
		// 					<TView borderColor='red' radius={3} >
		// 						{course.data.assignments.length > 0 && <TText color='subtext1' p={10} >assignements : {course.data.assignments.length}</TText>}
		// 					</TView>
		// 				}
		// 			</TView>
		// 		</TView>
		// 	</TView>
		// </TTouchableOpacity>
	);
};

const AssignmentDisplay: ReactComponent<{ assignment: Document<Assignment> }> = ({ assignment }) => {
	return (
		<TView flexColumnGap={'md'} flexDirection='row' justifyContent='space-between'>
			<TText numberOfLines={1} style={{ flex: 1 }}>
				{assignment.data.name}
			</TText>
			<TText color='subtext0'>
				{Time.toDate(assignment.data.dueDate).toLocaleString()}
			</TText>
		</TView>
	);
};