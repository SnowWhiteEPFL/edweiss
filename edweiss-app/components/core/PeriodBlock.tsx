import { Course, CourseTimePeriod } from '@/model/school/courses';
import TView from './containers/TView';
import formatTime from './formatTime';
import TText from './TText';

export const PeriodBlock = ({ period, course, user }: {
    period: CourseTimePeriod; course: { id: string; data: Course; }; user: any;
}) => {
    return (
        <TView flexDirection="column">
            <TView flexDirection="row" justifyContent="space-between">
                <TText color="course_title_for_backgroud_color" numberOfLines={1} size={15} p={5}>
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
            </TView>
            {user.data.type == 'student' && course.data.started && period.type == 'lecture' && <TText p={5} size={15} color="red">Join Course</TText>}
            {user.data.type == 'professor' && period.type == 'lecture' && <TText p={5} size={15} color={course.data.started ? "red" : "green"}>{(!course.data.started && "Start Course") || (course.data.started && "Stop Course")}</TText>}
        </TView>
    );
};
