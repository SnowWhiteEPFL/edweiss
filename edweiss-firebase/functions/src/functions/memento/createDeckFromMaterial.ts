import prompt from 'actions/ai';
import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, Collections, clean, getRequiredDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { COURSE_NOT_FOUND, fail, ok } from 'utils/status';
const pdf = require('pdf-parse');
import admin = require('firebase-admin');

export const createDeckFromMaterial = onSanitizedCall(Memento.Functions.createDeckFromMaterial, {
	courseId: Predicate.isNonEmptyString,
	// materialId: Predicate.isNonEmptyString,
	materialUrl: Predicate.isNonEmptyString,
}, async (userId, args) => {
	const course = await getRequiredDocument(Collections.courses, args.courseId, COURSE_NOT_FOUND);
	// const material = await getRequiredDocument(CollectionOf<Material>(`courses/${args.courseId}/materials`), args.materialId, fail('material_not_found'));

	// const doc = material.docs[0];

	const deckCollection = CollectionOf<Memento.Deck>(`users/${userId}/courses/${args.courseId}/decks`);

	let pdfContentCache = "";
	let step = "0";

	try {
		// if (doc.type == "slides") {
		if (true) {
			// const [rawData] = await admin.storage().bucket().file(doc.url).download();
			const [rawData] = await admin.storage().bucket().file(args.materialUrl).download();

			step = "1";

			let pdfContentRaw;
			let pdfContent = "";
			try {
				pdfContentRaw = await pdf(rawData);
				pdfContent = pdfContentRaw.text;
			} catch (e) {
				return fail("error-parsing-pdf");
			}

			pdfContentCache = pdfContent;

			step = "2";

			if (typeof pdfContent != "string")
				return fail({
					mySpecialCase: "pdf-content-not-string",
					pdfContent: pdfContent == undefined ? "my-undefined!!!" : pdfContent,
					pdfContentRaw,
				});

			if (pdfContent == undefined || pdfContent == null)
				return fail("pdf-content-undefined");

			// pdfContent = pdfContent.substring(0, Math.min(pdfContent.length - 1, 2000));

			step = "3";

			const TOKEN_END_QUESTION = "<TOKEN_END_QUESTION>";
			const TOKEN_END_ANSWER = "<TOKEN_END_ANSWER>";

			const numberOfFlashcards = 5;

			const rawAI = await prompt({
				task: `
				This is a "${course.name}" lecture at prestigious university EPFL.
				Description of the course: ${course.description}.

				You are a flash card generating AI. Your purpose is to generate pairs of question/answer strings
				about the user content. It should be challenging but also rewarding.

				You can use rich text features if necessary (such as LaTeX with $ and code with three backticks).

				Do not write any other content or confirmation text.
				Generate ${numberOfFlashcards} flash cards (question/answer pair).

				Each flashcard should have the following format: Question${TOKEN_END_QUESTION}Answer${TOKEN_END_ANSWER}
				Like the following :
				What are $1 + 1$?${TOKEN_END_QUESTION}$2$${TOKEN_END_ANSWER}
				What is the color of the sky?${TOKEN_END_QUESTION}Blue${TOKEN_END_ANSWER}
				What is $e^{i\\pi} - 1$ ?${TOKEN_END_QUESTION}This is Euler's identity, it is equal to $0$${TOKEN_END_ANSWER}
			`,
				content: pdfContent,
				fallback: undefined
			});

			step = "4";

			if (rawAI == undefined)
				return fail("error-prompt-ai-pdf");

			const cards: Memento.Card[] = rawAI.split(TOKEN_END_ANSWER).map(flashcard => {
				const split = flashcard.split(TOKEN_END_QUESTION);

				if (split.length != 2)
					return undefined;

				const question = split[0].trim();
				const answer = split[1].trim();

				return {
					ownerID: userId,
					question,
					answer,
					learning_status: "Not yet"
				} satisfies Memento.Card;
			}).filter(o => o != undefined) as Memento.Card[];

			step = "5";

			if (cards.length == 0)
				return fail("no-card-generated-pdf");

			step = "6";

			const deck: Memento.Deck = {
				name: "AI-Generated Deck",
				ownerID: [userId],
				cards
			};

			step = "7";

			try {
				const res = await deckCollection.add(clean(deck));
				step = "8";
				return ok({ id: res.id });
			} catch (e) {
				return fail("firebase-error");
			}
		}
	} catch (e: any) {
		return { ...e, step, pdfContentCache };
	}

	return fail("wrong-material-type");
});



// return [split[0].trim(), split[1].trim()] as const;
// const cards: { question: string, answer: string }[] = [];
// for (let i = 0; i < flashcardElements.length; i += 2) {
// 	const question = flashcardElements[i];
// 	if (i == flashcardElements.length - 1)
// 		continue;
// 	const answer = flashcardElements[i + 1];

// 	cards.push({
// 		question,
// 		answer
// 	});
// }