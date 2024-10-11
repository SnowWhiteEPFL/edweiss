import { Timestamp } from '../time';
import { ProfessorID, StudentID } from '../users';
import { CourseTimePeriodType, CyclicTimePeriod } from './schedule';

export type CourseID = string & {};

export type Credits = number & {};

export type Section = "IN" | "COM" | "PH" | "MT";
export const courseColors = {
	lecture: 'lightblue',
	exercises: 'lightgreen',
	lab: 'lightyellow',
	project: 'lightcoral',
};

export interface CourseTimePeriod extends CyclicTimePeriod {
	type: CourseTimePeriodType;
}

export interface Course {
	name: string;
	description: string;
	professors: ProfessorID[];
	assistants: StudentID[];
	periods: CourseTimePeriod[];
	section: Section;
	credits: Credits;
	newAssignments: boolean;
	assignments: Assignment[];
}

export type AssignmentType = "quiz" | "submit";

export interface AssignmentBase {
	type: AssignmentType;
	name: string;
	dueDate: Timestamp;
}

export type Assignment = AssignmentBase;

export function isProfessorOf(professor: ProfessorID, course: Course) {
	return course.professors.includes(professor);
}

export function isAssistantOf(student: StudentID, course: Course) {
	return course.assistants.includes(student);
}
