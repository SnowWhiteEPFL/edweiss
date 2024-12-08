import { Course, CourseTimePeriod } from '@/model/school/courses';
import { Time } from '@/utils/time';
import TView from './containers/TView';
import TText from './TText';

/**
 * Component representing a block of time within a course period (e.g., lecture, lab).
 * Displays information based on user role, format, and course details.
 * 
 * @param period - The time period details for the course.
 * @param course - The course data associated with the period.
 * @param user - The current user viewing the course (can affect displayed actions).
 * @param format - Display format, either 'day' or 'week', impacting text size and layout.
 */
export const PeriodBlock = ({
    period,
    course,
    user,
    format
}: {
    period: CourseTimePeriod;
    course: { id: string; data: Course; };
    user: any;
    format: string;
}) => {
    // Set layout direction and text sizes based on the format ('day' or 'week')
    const direction = format === 'week' ? 'column' : 'row';
    const textSizePrimary = format === 'week' ? 12 : 15;
    const textSizeSecondary = format === 'week' ? 9 : 12;

    // Function to render the student action (Join Course)
    const renderStudentAction = (course: { id: string; data: Course }, period: CourseTimePeriod) => {
        if (course?.data.started && period.type === 'lecture') {
            return <TText p={5} size={15} color="red">Join Course</TText>;
        }
        return null;
    };

    // Function to render the professor action (Start/Stop Course)
    const renderProfessorAction = (course: { id: string; data: Course }, period: CourseTimePeriod) => {
        if (period.type === 'lecture') {
            return (
                <TText p={5} size={15} color={course.data.started ? "red" : "green"}>
                    {course.data.started ? "Stop Course" : "Start Course"}
                </TText>
            );
        }
        return null;
    };

    return (
        <TView flexDirection="column" testID='period-block-view'>
            <TView justifyContent="space-between" flexDirection={direction}>
                <TText color="constantBlack" numberOfLines={1} size={textSizePrimary} p={5}>
                    {`${period.type.charAt(0).toUpperCase() + period.type.slice(1)}`}
                </TText>
                <TText pl={5} pr={10} pt={7} color="overlay2" numberOfLines={1} size={textSizeSecondary}>
                    {period.rooms.join(", ")}
                </TText>
            </TView>

            <TText pl={5} pb={5} pt={3} color="overlay0" numberOfLines={1} size={textSizeSecondary}>
                {course?.data.name}
            </TText>

            <TView flexDirection={direction}>
                <TText p={3} size={textSizeSecondary} color="overlay2">
                    {`${Time.formatTime(period.start)} - ${Time.formatTime(period.end)}`}
                </TText>
            </TView>

            {/* Render action based on user type */}
            {user?.data.type === 'student' && renderStudentAction(course, period)}
            {user?.data.type === 'professor' && renderProfessorAction(course, period)}
        </TView>
    );
};
