import { onCall } from 'firebase-functions/v2/https';

import { CallResult, FirebaseFunction } from '../model/functions';

export function onAuthentifiedCall<Args, Result, Error>(
	_: FirebaseFunction<Args, Result, Error>,
	callback: (userId: string | undefined, args: Args) => Promise<CallResult<Result, Error>>
) {
	return onCall<Args>(async (request) => {
		// if (!request.auth?.uid)
		// 	return NOT_AUTHENTIFIED;

		return await callback(request.auth?.uid, request.data);
	});
}
