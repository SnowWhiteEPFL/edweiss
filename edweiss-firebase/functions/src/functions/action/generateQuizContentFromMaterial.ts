import prompt from 'actions/ai';
import Quizzes from 'model/quizzes';
import { onSanitizedCall } from 'utils/firebase';
import { Collections, getRequiredDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { COURSE_NOT_FOUND, fail, ok } from 'utils/status';
const pdf = require('pdf-parse');
import admin = require('firebase-admin');

export const generateQuizContentFromMaterial = onSanitizedCall(Quizzes.Functions.generateQuizContentFromMaterial, {
	courseId: Predicate.isNonEmptyString,
	materialUrl: Predicate.isNonEmptyString
}, async (userId, args) => {
	const course = await getRequiredDocument(Collections.courses, args.courseId, COURSE_NOT_FOUND);
	const [rawData] = await admin.storage().bucket().file(args.materialUrl).download();

	let pdfContent = "";
	try {
		pdfContent = (await pdf(rawData)).text;
	} catch (e) {
		return fail("error-parsing-pdf");
	}

	if (pdfContent == undefined || pdfContent == null)
		return fail("pdf-content-undefined");

	/**
questionmcq<TOKEN_END_QUESTION>
<TOKEN_CORRECT_PROPOSITION>proposition1<TOKEN_END_PROPOSITION>
<TOKEN_INCORRECT_PROPOSITION>proposition2<TOKEN_END_PROPOSITION>
<TOKEN_INCORRECT_PROPOSITION>proposition3<TOKEN_END_PROPOSITION>
<TOKEN_END_EXERCISE>
	 */

	const TOKEN_END_QUESTION = "<TOKEN_END_QUESTION>";
	const TOKEN_CORRECT_PROPOSITION = "<TOKEN_CORRECT_PROPOSITION>";
	const TOKEN_INCORRECT_PROPOSITION = "<TOKEN_INCORRECT_PROPOSITION>";
	const TOKEN_END_PROPOSITION = "<TOKEN_END_PROPOSITION>";
	const TOKEN_END_EXERCISE = "<TOKEN_END_EXERCISE>";

	const numberOfExercises = 5;

	const rawAI = await prompt({
		task: `
This is a "${course.name}" course at prestigious university EPFL.
Description of the course: ${course.description}.

You are a quiz generating AI. Your purpose is to generate Multiple-Choice Questions quiz
about the user content. It should be challenging but also rewarding.

Each exercise has 3 to 6 propositions.

A question may have mutliple correct answers.

Don't hesitate to use rich text features if necessary (such as LaTeX with $ and code with three backticks).

Generate ${numberOfExercises} exercises.

Each exercise should have the following format:
Question${TOKEN_END_QUESTION}
${TOKEN_CORRECT_PROPOSITION}Proposition A${TOKEN_END_PROPOSITION}
${TOKEN_INCORRECT_PROPOSITION}Proposition B${TOKEN_END_PROPOSITION}
${TOKEN_INCORRECT_PROPOSITION}Proposition C${TOKEN_END_PROPOSITION}
${TOKEN_END_EXERCISE}


Like the following :
Which of these real functions are bijective?${TOKEN_END_QUESTION}
${TOKEN_CORRECT_PROPOSITION}$f(x) = x$${TOKEN_END_PROPOSITION}
${TOKEN_INCORRECT_PROPOSITION}$f(x) = sin(x)$${TOKEN_END_PROPOSITION}
${TOKEN_INCORRECT_PROPOSITION}$f(x) = |x|$${TOKEN_END_PROPOSITION}
${TOKEN_CORRECT_PROPOSITION}$f(x) = e^{x}$ on $\\mathbb{R}^{+}$${TOKEN_END_PROPOSITION}
${TOKEN_END_EXERCISE}

What is the compiler error on the following code ?
${"```rust"}
fn print_string(str: String) {
	println!("{}", str);
}

fn main() {
	let text = "Hello, world!";
	print_string(text);
	print_string(text);
}
${"```"}
${TOKEN_END_QUESTION}
${TOKEN_INCORRECT_PROPOSITION}The variable "text" is not a string.${TOKEN_END_PROPOSITION}
${TOKEN_INCORRECT_PROPOSITION}"print_string" should return something, but it doesn't.${TOKEN_END_PROPOSITION}
${TOKEN_CORRECT_PROPOSITION}"text" has been moved in the first call of "print_string", it thus can't be used again.${TOKEN_END_PROPOSITION}
${TOKEN_END_EXERCISE}

Do not write any other content or confirmation text.
		`,
		content: pdfContent,
		fallback: undefined
	});

	if (rawAI == undefined)
		return fail("error-prompt-ai-pdf");

	const exercises = rawAI.split(TOKEN_END_EXERCISE).flatMap(exercise => {
		const questionPropositions = exercise.split(TOKEN_END_QUESTION);

		if (questionPropositions.length != 2)
			return [];

		const [question, rawPropositions] = questionPropositions;

		const taggedPropositions = rawPropositions.split(TOKEN_END_PROPOSITION).map(s => s.trim());

		const propositions: { text: string, correct: boolean }[] = taggedPropositions.flatMap(tg => {
			if (tg.startsWith(TOKEN_CORRECT_PROPOSITION)) {
				return [{
					text: tg.substring(TOKEN_CORRECT_PROPOSITION.length).trim(),
					correct: true
				}];
			} else if (tg.startsWith(TOKEN_INCORRECT_PROPOSITION)) {
				return [{
					text: tg.substring(TOKEN_INCORRECT_PROPOSITION.length).trim(),
					correct: false as boolean
				}];
			} else return [];
		});

		if (question.length == 0 || propositions.length == 0)
			return [];

		return [{ question, propositions }];
	});

	if (exercises.length == 0)
		return fail("no-exercise-generated");

	return ok({
		generatedExercises: exercises
	});
});
