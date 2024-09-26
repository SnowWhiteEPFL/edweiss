import Functions from '../model/functions';
import { onAuthentifiedCall } from '../utils/firebase';
import { fail, ok } from '../utils/status';

export const helloWorld = onAuthentifiedCall(Functions.helloWorld, async (userId, args) => {
	if (args.request.length == 0)
		return fail("request_empty");

	return ok({ message: "Hello, world !" });
});
