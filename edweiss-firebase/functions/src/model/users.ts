import { FunctionFolder, FunctionOf } from './functions';
import { CourseID } from './school/courses';
import { Timestamp } from './time';

export type UserID = string & {};

export type StudentID = string & {};

export type ProfessorID = string & {};

export type FCMToken = string;

export type AppUserType = "student" | "professor";

interface AppUserBase {
	type: AppUserType;
	name: string;
	createdAt: Timestamp;
	fcmTokens?: FCMToken[];
}

export interface StudentUser extends AppUserBase {
	type: "student";
	courses: CourseID[];
}

export interface ProfessorUser extends AppUserBase {
	type: "professor";
	courses: CourseID[];
}

export type AppUser = StudentUser | ProfessorUser;

export namespace Auth {
	export const Functions = FunctionFolder("auth", {
		createAccount: FunctionOf<{ name: string; }, {}, 'already_existing_account'>("createAccount"),
	});
}

export namespace FCMCommunication {
	export const Functions = FunctionFolder("fcm", {
		registerFCMToken: FunctionOf<{ fcmToken: string; }, {}, 'successfully_saved_token' | 'invalid_userID' | 'invalid_fcm_tokens' | 'firebase_error'>("registerFCMToken"),
		sendFCMPage: FunctionOf<{ page: number; }, {}, 'successfully_sent' | 'invalid_userID' | 'invalid_page' | 'firebase_error'>("sendFCMPage"),
	});
}

