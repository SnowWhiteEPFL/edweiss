import { Color } from '@/constants/Colors';
import { Course, courseColors, CourseTimePeriod } from '@/model/school/courses';
import { router } from 'expo-router';
import TTouchableOpacity from './containers/TTouchableOpacity';
import { PeriodBlock } from './PeriodBlock';

const HOUR_BLOCK_HEIGHT = 80;

export const Day = ({ period, course, user, filteredPeriods, index, format }: {
    period: CourseTimePeriod; course: { id: string; data: Course; }; user: any; filteredPeriods: any[]; index: number; format: string;
}) => {
    const periodHeight = period.end ? ((period.end - period.start) / 60) * HOUR_BLOCK_HEIGHT : HOUR_BLOCK_HEIGHT;
    const pathname = user.data.type == 'professor' ? '/(app)/startCourseScreen' : '/(app)/lectures/slides';
    const params = user.data.type == 'professor' ? {
        courseID: course.id, course: JSON.stringify(course.data), period: JSON.stringify(period), index,
    } : {
        courseNameString: course.data.name,
        lectureIdString: period.activityId
    };
    return (

        <TTouchableOpacity
            key={index}
            flex={1 / filteredPeriods.length}
            borderColor="overlay2"
            radius={10}
            b={2}

            onPress={() => {
                {
                    router.push({
                        pathname: pathname,
                        params: params
                    });
                }
            }}
            backgroundColor={courseColors[period.type as keyof typeof courseColors] as Color || 'base'}
            style={{
                height: periodHeight,
            }}
        >
            <PeriodBlock period={period} format={format} course={course} user={user} />
        </TTouchableOpacity>
    );
};
