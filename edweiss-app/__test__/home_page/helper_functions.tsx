import { AssignmentBase, CourseTimePeriod, Section } from '@/model/school/courses';
import { CourseTimePeriodType } from '@/model/school/schedule';
import { ProfessorID, StudentID } from '@/model/users';


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
    data: {
        id: string;
        name: string;
        periods: CourseTimePeriod[];
        professors: ProfessorID[];
        assistants: StudentID[];
        credits: number;
        section: Section;
        description: string;
        assignments: AssignmentBase[];
        newAssignments: boolean;
        started: boolean;
    }
}

// Default values for optional parameters
const defaultCourseDescription = 'Default course description';

export const initCourse = (params: InitCourseParams) => {
    const { id, data } = params;
    const { name, periods, professors, assistants, description = defaultCourseDescription, section, credits, assignments, newAssignments, started } = data;
    return {
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
    };
};
