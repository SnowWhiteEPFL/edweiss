import prompt from 'actions/ai';
import Experiments from 'model/experiments';
import { onAuthentifiedCall } from 'utils/firebase';
import { Predicate, assertNonEmptyString, assertThat } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

/**
 * This is only an experiment, don't actually use this.
 */

export const promptAI = onAuthentifiedCall(Experiments.functions.promptAI, async (userId, args) => {
	assertNonEmptyString(args.task);
	assertThat(args.content, Predicate.isOptionalString);

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
