import { onCall } from 'firebase-functions/v2/https';

import { CallResult, FirebaseFunction } from '../model/functions';
import { NOT_AUTHENTIFIED } from './status';

export function onAuthentifiedCall<Args, Result, Error>(
	_: FirebaseFunction<Args, Result, Error>,
	callback: (userId: string, args: Args) => Promise<CallResult<Result, Error>>
) {
	return onCall<Args>(async (request) => {
		if (!request.auth?.uid)
			return NOT_AUTHENTIFIED;

		return await callback(request.auth.uid, request.data);
	});
}
