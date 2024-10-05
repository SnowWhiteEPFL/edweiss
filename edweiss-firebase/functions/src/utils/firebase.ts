import { onCall } from 'firebase-functions/v2/https';

import { CallResult, FunctionSignature } from 'model/functions';
import { NOT_AUTHENTIFIED } from './status';

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

		return await callback(request.auth.uid, request.data);
	});

	return { signature, handler };
}
