import { Color } from '@/constants/Colors';
import { Course, courseColors, CourseTimePeriod } from '@/model/school/courses';
import { router } from 'expo-router';
import TTouchableOpacity from './containers/TTouchableOpacity';
import { PeriodBlock } from './PeriodBlock';

const HOUR_BLOCK_HEIGHT = 80;
const TOTAL_HOURS = 24;

export const Day = ({ period, course, user, filteredPeriods, index }: {
    period: CourseTimePeriod; course: { id: string; data: Course; }; user: any; filteredPeriods: any[]; index: number;
}) => {
    const periodHeight = period.end ? ((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT : HOUR_BLOCK_HEIGHT;

    return (

        <TTouchableOpacity
            key={index}
            flex={1 / filteredPeriods.length}
            borderColor="overlay2"
            radius={10}
            b={2}
            p={2}
            onPress={() => {
                {
                    user.data.type == 'professor' && router.push({
                        pathname: '/(app)/startCourseScreen',
                        params: {
                            courseID: course.id, course: JSON.stringify(course.data), period: JSON.stringify(period), index,
                        }
                    });
                }
                {
                    user.data.type == 'student' && course.data.started && period.type == 'lecture' && router.push({
                        pathname: '/(app)/lectures/slides' as any,
                        params: {
                            courseNameString: course.data.name,
                            lectureIdString: period.activityId
                        }
                    });
                };
            }}
            backgroundColor={courseColors[period.type as keyof typeof courseColors] as Color || 'base'}
            style={{
                height: periodHeight
            }}
        >
            <PeriodBlock period={period} course={course} user={user} />
        </TTouchableOpacity>
    );
};
