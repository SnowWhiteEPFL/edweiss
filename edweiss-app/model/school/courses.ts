import { FunctionFolder, FunctionOf } from '../functions';
import { Timestamp } from '../time';
import { ProfessorID, StudentID } from '../users';
import { CourseTimePeriodType, CyclicTimePeriod } from './schedule';

export type CourseID = string & {};

export type Credits = number & {};

export type AssignmentID = string & {};

export type MaterialID = string & {};

export type Section = "IN" | "SC" | "MA" | "PH" | "CGC" | "EL" | "GM" | "MT" | "MX" | "SV" | "AR" | "GC" | "SIE";

export interface CourseTimePeriod extends CyclicTimePeriod {
	type: CourseTimePeriodType;
}

export const MAX_COURSE_NAME_LENGTH = 30;
export const MAX_COURSE_DESCRIPTION_LENGTH = 400;
export const MAX_COURSE_CREDITS = 30;

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

export type AssignmentType = "quiz" | "submission";

export const MAX_ASSIGNMENT_NAME_LENGTH = 20;
export interface AssignmentBase {
	type: AssignmentType;
	name: string;
	dueDate: Timestamp;
}

export type Assignment = AssignmentBase;

export type MaterialType = "slide" | "exercise" | "image" | "feedback" | "other";

export interface MaterialDocument {
	uri: string;
	title: string;
	type: MaterialType;
}

export const MAX_MATERIAL_TITLE_LENGTH = 30;
export const MAX_MATERIAL_DESCRIPTION_LENGTH = 300;

export interface Material {
	title: string;
	description: string;
	from: Timestamp;
	to: Timestamp;
	docs: MaterialDocument[]; // References pointing to MaterialDocument
}

export function isProfessorOf(professor: ProfessorID, course: Course) {
	return course.professors.includes(professor);
}

export function isAssistantOf(student: StudentID, course: Course) {
	return course.assistants.includes(student);
}

export namespace Course_functions {
	export const Functions = FunctionFolder("course", {
		toogleCourse: FunctionOf<{ courseID: CourseID, course: Course; }, {}, 'cannot stop the course'>("toogleCourse"),
		tooglePeriod: FunctionOf<{ lectureID: string, courseID: CourseID, course: Course; }, { available: boolean; }, 'cannot stop the course'>("tooglePeriod"),

		updateCourse: FunctionOf<{ courseID: CourseID, courseJSON: string; }, {}, 'cannot update the course'>("updateCourse"),

		addAssignment: FunctionOf<{ courseID: CourseID, assignmentJSON: string; }, { assignmentID: AssignmentID }, 'cannot add the assignment'>("addAssignment"),
		removeAssignment: FunctionOf<{ courseID: CourseID, assignmentID: AssignmentID; }, {}, 'cannot remove the assignment'>("removeAssignment"),
		updateAssignment: FunctionOf<{ courseID: CourseID, assignmentID: AssignmentID, assignmentJSON: string; }, {}, 'cannot update the assignment'>("updateAssignment"),

		addMaterial: FunctionOf<{ courseID: CourseID, materialJSON: string; }, { materialID: MaterialID }, 'cannot add the material'>("addMaterial"),
		removeMaterial: FunctionOf<{ courseID: CourseID, materialID: MaterialID; }, {}, 'cannot remove the material'>("removeMaterial"),
		updateMaterial: FunctionOf<{ courseID: CourseID, materialID: MaterialID, materialJSON: string; }, {}, 'cannot update the material'>("updateMaterial"),

		addProfessor: FunctionOf<{ courseID: CourseID, professorID: ProfessorID; }, {}, 'cannot add the professor'>("addProfessor"),
		removeProfessor: FunctionOf<{ courseID: CourseID, professorID: ProfessorID; }, {}, 'cannot remove the professor'>("removeProfessor"),

		addAssistant: FunctionOf<{ courseID: CourseID, assistantID: StudentID; }, {}, 'cannot add the assistant'>("addAssistant"),
		removeAssistant: FunctionOf<{ courseID: CourseID, assistantID: StudentID; }, {}, 'cannot remove the assistant'>("removeAssistant"),

		createCourse: FunctionOf<{ courseJSON: string; }, { courseID: CourseID; }, 'cannot create the course'>("createCourse"),
	});
}

export type UpdateCourseArgs = {
	name: string,
	description: string,
	credits: Credits,
	section: Section,
}
