import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const createCard = onSanitizedCall(Memento.Functions.createCard, {
	deckId: Predicate.isNonEmptyString,
	card: Predicate.fields({
		answer: Predicate.isNonEmptyString,
		question: Predicate.isNonEmptyString,
		learning_status: Predicate.isOptional(Predicate.isIn(["Got it", "Not yet"] as const))
	}),
	courseId: Predicate.isNonEmptyString
}, async (userId, args) => {
	const deckCollection = CollectionOf<Memento.Deck>(`users/${userId}/courses/${args.courseId}/decks`);
	const deckDoc = await deckCollection.doc(args.deckId).get();
	const deckData = deckDoc.data();

	const updatedCards = deckData?.cards ? [...deckData.cards, args.card] : [args.card];
	await deckCollection.doc(args.deckId).update({ cards: updatedCards });

	return ok({ id: args.deckId });
});
