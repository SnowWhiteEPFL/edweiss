import prompt from 'actions/ai';
import Experiments from 'model/experiments';
import { onSanitizedCall } from 'utils/firebase';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

/**
 * This is only an experiment, don't actually use this.
 */

export const promptAI = onSanitizedCall(Experiments.functions.promptAI, {
	task: Predicate.isNonEmptyString,
	content: Predicate.isOptionalString
}, async (_, args) => {
	const res = await prompt({
		task: args.task,
		content: args.content,
		fallback: "OpenAI Error"
	});

	return ok(res);
});
