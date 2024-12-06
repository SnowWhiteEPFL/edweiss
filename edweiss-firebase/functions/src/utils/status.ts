import { FailedCallResult, SuccessfulCallResult } from '../model/functions';

export const OK = ok({});
export const FAILED = fail('failed');

export const NOT_AUTHENTIFIED = fail('not_authentified');
export const INTERNAL_ERROR = fail('internal_error');
export const INVALID_ARGUMENT = fail('invalid_argument');

export const USER_NOT_FOUND = fail('user_not_found');
export const COURSE_NOT_FOUND = fail('user_not_found');
export const NOT_IN_COURSE = fail('not_in_course');

export const INVALID_COURSE_ID = fail('invalid_course_id');

export function ok<R>(data: R): SuccessfulCallResult<R> {
	return { status: 1, data };
}

export function fail<E>(error: E): FailedCallResult<E> {
	return { status: 0, error };
}

export function catched_error(error: any) {
	return Object.keys(error).length == 0 ? INTERNAL_ERROR : error;
}
