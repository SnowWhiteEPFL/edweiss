import { FunctionFolder, FunctionOf } from '../functions';
import { Timestamp } from '../time';

export type UserID = string & {};

export interface AppUser {
	name: string;
	createdAt: Timestamp;
}

export namespace Auth {
	export const Functions = FunctionFolder("auth", {
		createAccount: FunctionOf<{ name: string; }, {}, 'already_existing_account'>("createAccount"),
	});
}
