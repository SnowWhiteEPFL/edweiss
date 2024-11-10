import prompt from 'actions/ai';
import Experiments from 'model/experiments';
import { onAuthentifiedCall } from 'utils/firebase';
import { fail, ok } from 'utils/status';

export const promptAI = onAuthentifiedCall(Experiments.functions.promptAI, async (userId, args) => {
	try {
		const res = await prompt({
			task: args.task,
			content: args.content,
			fallback: "OpenAI Error"
		});

		return ok(res);
	} catch (e) {
		return fail({ key: process.env.OPENAI_API_KEY, e });
	}
});
