import { FunctionFolder, FunctionOf } from '../functions';
import { Timestamp } from '../time';
import { ProfessorID, StudentID } from '../users';
import { CourseTimePeriodType, CyclicTimePeriod } from './schedule';

export type CourseID = string & {};

export type Credits = number & {};

export type Section = "IN" | "COM" | "PH" | "MT";

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
	started: boolean;
}

export type AssignmentType = "quiz" | "submit";

export interface AssignmentBase {
	type: AssignmentType;
	name: string;
	dueDate: Timestamp;
}

export type Assignment = AssignmentBase;

export type MaterialType = "slides" | "exercises" | "feedbacks" | "other";

export interface MaterialDocument {
	url: string;
	title: string;
	type: MaterialType;
}

export interface Material {
	from: Timestamp;
	to: Timestamp;
	docs: MaterialDocument[]; // References pointing to MaterialDocument
	description: string;
}

export function isProfessorOf(professor: ProfessorID, course: Course) {
	return course.professors.includes(professor);
}

export function isAssistantOf(student: StudentID, course: Course) {
	return course.assistants.includes(student);
}

export namespace Course_functions {
	export const Functions = FunctionFolder("course", {
		toogleCourse: FunctionOf<{ courseID: string, course: Course; }, {}, 'cannot stop the course'>("toogleCourse"),
		tooglePeriod: FunctionOf<{ lectureID: string, courseID: string, course: Course; }, { available: boolean; }, 'cannot stop the course'>("tooglePeriod"),
	});
}
