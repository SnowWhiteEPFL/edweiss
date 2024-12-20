import { onCall } from 'firebase-functions/v2/https';

import { CallResult, FailedCallResult, FunctionSignature } from 'model/functions';
import { Predicate, PredicateOnFields, assertThat } from './sanitizer';
import { INTERNAL_ERROR, NOT_AUTHENTIFIED } from './status';

export interface FunctionImplementation {
	signature: any,
	handler: any;
}

export function onAuthentifiedCall<Args, Result, Error>(
	signature: FunctionSignature<Args, Result, Error>,
	callback: (userId: string, args: Args) => Promise<CallResult<Result, Error>>
): FunctionImplementation {
	const handler = onCall<Args>(async (request) => {
		if (!request.auth?.uid)
			return NOT_AUTHENTIFIED;

		try {
			return await callback(request.auth.uid, request.data);
		} catch (e: FailedCallResult<Error> | any) {
			if (e.status == 0)
				return e;

			return INTERNAL_ERROR;
		}
	});

	return { signature, handler };
}

/**
 * This function achieves practically the same thing as `onAuthentifiedCall`, it additionnaly
 * checks if the arguments predicates are satisfied before the callback.
 * 
 * @param signature The function signature that defines all relevant types
 * @param sanitizer All predicates that the argument fields must satisfy 
 * @param callback The actual business logic
 * @returns The function handler
 */
export function onSanitizedCall<Args extends object, Result, Error>(
	signature: FunctionSignature<Args, Result, Error>,
	sanitizer: PredicateOnFields<Args>,
	callback: (userId: string, args: Args) => Promise<CallResult<Result, Error>>
): FunctionImplementation {
	const handler = onCall<Args>(async (request) => {
		if (!request.auth?.uid)
			return NOT_AUTHENTIFIED;

		try {
			assertThat(request.data, Predicate.fields(sanitizer));
			return await callback(request.auth.uid, request.data);
		} catch (e: FailedCallResult<Error> | any) {
			if (e.status == 0)
				return e;

			return INTERNAL_ERROR;
		}
	});

	return { signature, handler };
}
