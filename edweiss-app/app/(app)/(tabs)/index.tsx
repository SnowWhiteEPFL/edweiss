import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import For from '@/components/core/For';
import HeaderButton from '@/components/core/header/HeaderButton';
import HeaderButtons from '@/components/core/header/HeaderButtons';
import RouteHeader from '@/components/core/header/RouteHeader';
import Icon from '@/components/core/Icon';
import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import { quizIcon, submissionIcon } from '@/components/courses/AssignmentDisplay';
import { CollectionOf, Document } from '@/config/firebase';
import t from '@/config/i18config';
import { Color, courseColors } from '@/constants/Colors';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useCourses } from '@/contexts/courses';
import { useDocs } from '@/hooks/firebase/firestore';
import { Assignment, Course } from '@/model/school/courses';
import { Time } from '@/utils/time';
import { Href, router } from 'expo-router';
import React from 'react';

const HomeTab: ApplicationRoute = () => {
	const courses = useCourses();

	if (courses == undefined)
		return <TActivityIndicator size={40} />

	return (
		<>
			<RouteHeader title='Home' right={
				<HeaderButtons>
					<HeaderButton onPress={() => router.push("/notifs/notifications" as Href<string>)} icon='notifications-outline' />
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

			<SchedulePoint color={courseColors["lecture"]} time='thu. 015:15' name='Computer Security' room='CE4' />
			<SchedulePoint color={courseColors["lecture"]} time='thu. 17:15' name='Quantum Mechanics for Non-Physicists' room='INF100' />
			<SchedulePoint color={courseColors["project"]} time='fri. 11:15' name='Software Entreprise' room='ELE20' />

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

	const validAssignment = assignments && assignments.length > 0 ? assignments.filter(a => {
		return Time.toDate(a.data.dueDate).getTime() > new Date().getTime();
	}).sort((a, b) => {
		return Time.toDate(a.data.dueDate).getTime() - Time.toDate(b.data.dueDate).getTime();
	}) : undefined

	return (
		<TTouchableOpacity onPress={() => router.push(`/courses/${course.id}`)} radius={'md'} backgroundColor='base' mx={'md'} p={'md'} mb={"md"}>
			<TText size={"sm"} bold color='subtext0' mb={"sm"}>
				{course.data.name}
			</TText>

			<For each={validAssignment}
				fallback={<TText size={'sm'} color='overlay1'>{t("home:no_assignments")}</TText>}
			>
				{assignment => <AssignmentDisplay key={assignment.id} assignment={assignment} />}
			</For>
		</TTouchableOpacity>
	);
};

const AssignmentDisplay: ReactComponent<{ assignment: Document<Assignment> }> = ({ assignment }) => {
	const urgent = Time.toDate(assignment.data.dueDate).getTime() - (1000 * 60 * 60 * 24 * 1) <= new Date().getTime();

	return (
		<TView mb={2} flexColumnGap={'md'} flexDirection='row' alignItems='center' justifyContent='space-between'>
			<Icon color={urgent ? 'yellow' : 'subtext0'} name={assignment.data.type == "quiz" ? quizIcon : submissionIcon} />
			<TText color={urgent ? 'yellow' : 'text'} numberOfLines={1} style={{ flex: 1 }}>
				{assignment.data.name}
			</TText>
			<TText color={urgent ? 'yellow' : 'subtext0'} size={"sm"}>
				{Time.toDate(assignment.data.dueDate).toLocaleDateString()}
			</TText>
		</TView>
	);
};