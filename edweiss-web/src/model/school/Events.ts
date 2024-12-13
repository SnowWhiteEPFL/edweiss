import { Course, CourseTimePeriod } from './courses';
import { Room } from './schedule';

interface CustomEvents {
    name: string;
    startTime: number;
    endTime?: number;
    rooms?: Room[];
    period?: CourseTimePeriod;
    course?: { id: string, data: Course };
    todo?: { id: string, data: any };
    type: "Todo" | "Course" | "Assignment";
    assignmentID?: string;
}