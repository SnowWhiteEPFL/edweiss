
export type NoArgs = {};

export type NoResult = {};

export type NoError = {};

export interface FunctionSignature<Args, Result, Error> {
	originalName: string;
	path: string;
	exportedName: string;
}

export function FunctionOf<Args, Result, Error>(name: string): FunctionSignature<Args, Result, Error> {
	return { originalName: name, path: name, exportedName: name };
}

export interface SuccessfulCallResult<Result> {
	status: 1,
	data: Result;
}

export interface FailedCallResult<Error> {
	status: 0,
	error: Error;
}

export type CallResult<R, E> = SuccessfulCallResult<R> | FailedCallResult<E>;

export function FunctionFolder<T>(folder: string, declared: T): T {
	if (folder === ".")
		return declared;

	const functions = Object.values(declared as any) as any;

	for (let i = 0; i < functions.length; i++) {
		if (functions[i].path == undefined) {
			FunctionFolder(folder, functions[i]);
			continue;
		}

		functions[i].path = `${folder}/${functions[i].path}`;
		functions[i].exportedName = `${folder}_${functions[i].exportedName}`;
	}

	return declared;
}
