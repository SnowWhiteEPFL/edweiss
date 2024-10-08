import { FunctionFolder, FunctionOf } from './functions';
import { Timestamp } from './time';

export type UserID = string & {};

export type StudentID = string & {};

export type ProfessorID = string & {};

export type AppUserType = "student" | "professor";

interface AppUserBase {
	type: AppUserType;
	name: string;
	createdAt: Timestamp;
}

export interface StudentUser extends AppUserBase {
	type: "student";
}

export interface ProfessorUser extends AppUserBase {
	type: "professor";
}

export type AppUser = StudentUser | ProfessorUser;

export namespace Auth {
	export const Functions = FunctionFolder("auth", {
		createAccount: FunctionOf<{ name: string; }, {}, 'already_existing_account'>("createAccount"),
	});
}
