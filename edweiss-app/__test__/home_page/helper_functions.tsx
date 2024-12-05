import { Course, CourseTimePeriod } from '@/model/school/courses';
import { CourseTimePeriodType } from '@/model/school/schedule';

// Helper functions to initialize mock objects
export const initPeriod = (
    start: number,
    end: number,
    type: CourseTimePeriodType,
    activityId: string,
    dayIndex: number,
    roomName: string
): CourseTimePeriod => ({
    start,
    end,
    type,
    activityId,
    dayIndex,
    rooms: [{ name: roomName, geoloc: { latitude: 0, longitude: 0 } }],
});

// Parameters for initializing a course
export interface InitCourseParams {
    id: string;
    data: Course
}

// Default values for optional parameters
const defaultCourseDescription = 'Default course description';

export const initCourse = ({
    id,
    data: {
        name,
        periods = [],
        professors = ['Default Professor'],
        assistants = ['Default Assistant'],
        description = defaultCourseDescription,
        section = 'IN',
        credits = 3,
        assignments = [],
        newAssignments = false,
        started = true,
    }
}: InitCourseParams) => ({
    id,
    data: {
        name,
        periods,
        professors,
        assistants,
        description,
        section,
        credits,
        assignments,
        newAssignments,
        started,
    },
});
