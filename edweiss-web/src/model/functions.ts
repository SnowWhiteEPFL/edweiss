import { Deck } from './memento';

export interface FirebaseFunction<Args, Result, Error> {
	name: string
}

function FunctionOf<Args, Result, Error>(name: string): FirebaseFunction<Args, Result, Error> {
	return { name };
}

export type NoArgs = {};

export type NoResult = {};

export type NoError = {};

export interface SuccessfulCallResult<Result> {
	status: 1,
	data: Result
}

export interface FailedCallResult<Error> {
	status: 0,
	error: Error
}

export type CallResult<R, E> = SuccessfulCallResult<R> | FailedCallResult<E>;

export namespace Functions {
	export const helloWorld = FunctionOf<{ request: string }, { message: string }, 'request_empty'>("helloWorld");
	export const createDeck = FunctionOf<{ deck: Deck }, { id: string }, 'empty_deck'>("createDeck");
	export const createAccount = FunctionOf<{ name: string }, {}, 'already_existing_account'>("createAccount");
}

export default Functions;
