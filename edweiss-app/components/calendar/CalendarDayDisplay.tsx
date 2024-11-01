import { Document } from '@/config/firebase';
import { courseColors } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { Course, CourseTimePeriod } from '@/model/school/courses';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';
import { PeriodBlock } from './PeriodBlock';

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 24;

const CalendarDayDisplay: ReactComponent<{ period: CourseTimePeriod; course: Document<Course>; user: any; filteredPeriods: CourseTimePeriod[]; index: number }> = ({ period, course, user, filteredPeriods, index }) => {
	const periodHeight = period.end ? ((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT : HOUR_BLOCK_HEIGHT;

	return (
		<TTouchableOpacity
			key={index}
			flex={1 / filteredPeriods.length}
			borderColor="blue"
			radius={10}
			b={2}
			p={2}
			onPress={() => {
				// This should take to either the course page or a special period page with all the information
				// relevant to it (rooms, professors, TAs etc)
				// {
				// 	user.data.type == 'professor' && router.push({
				// 		pathname: '/(app)/startCourseScreen',
				// 		params: {
				// 			courseID: course.id, course: JSON.stringify(course.data), period: JSON.stringify(period), index,
				// 		}
				// 	});
				// }
				// { Deprecated since the Course model does not provide a "started" field anymore.
				// 	user.data.type == 'student' && course.data.started && period.type == 'lecture' && router.push({
				// 		pathname: '/(app)/lectures/slides' as any,
				// 		params: {
				// 			courseNameString: course.data.name,
				// 			lectureIdString: period.activityId
				// 		}
				// 	});
				// };
			}}
			backgroundColor={courseColors[period.type]}
			style={{
				height: periodHeight
			}}
		>
			<PeriodBlock period={period} course={course} />
		</TTouchableOpacity>
	);
};

export default CalendarDayDisplay;
