import { Course, CourseTimePeriod } from '@/model/school/courses';
import TView from './containers/TView';
import formatTime from './formatTime';
import TText from './TText';

export const PeriodBlock = ({ period, course, user, format }: {
    period: CourseTimePeriod; course: { id: string; data: Course; }; user: any; format: String;
}) => {
    const direction = format == 'week' ? 'column' : 'row';
    const size1 = format == 'week' ? 12 : 15;
    const size2 = format == 'week' ? 9 : 12;
    return (
        <TView flexDirection="column">
            <TView justifyContent="space-between" flexDirection={direction}>
                <TText color="course_title_for_backgroud_color" numberOfLines={1} size={size1} p={5}>
                    {`${period.type.charAt(0).toUpperCase() + period.type.slice(1)}`}
                </TText>
                <TText pl={5} pr={10} pt={7} color="overlay2" numberOfLines={1} size={size2}>
                    {`${period.rooms.join(", ")}`}
                </TText>
            </TView>
            <TText pl={5} pb={5} pt={3} color="overlay0" numberOfLines={1} size={size2}>
                {`${course.data.name}`}
            </TText>
            <TView flexDirection={direction}>
                <TText p={3} size={size2} color="overlay2">
                    {`${formatTime(period.start)} - ${formatTime(period.end)}`}
                </TText>
            </TView>
            {user.data.type == 'student' && course.data.started && period.type == 'lecture' && <TText p={5} size={15} color="red">Join Course</TText>}
            {user.data.type == 'professor' && period.type == 'lecture' && <TText p={5} size={15} color={course.data.started ? "red" : "green"}>{(!course.data.started && "Start Course") || (course.data.started && "Stop Course")}</TText>}
        </TView >
    );
};
