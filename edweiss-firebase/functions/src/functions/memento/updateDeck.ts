import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const updateDeck = onSanitizedCall(Memento.Functions.updateDeck, {
	deckId: Predicate.isNonEmptyString,
	name: Predicate.isNonEmptyString,
	public: Predicate.isBoolean,
	courseId: Predicate.isNonEmptyString
}, async (userId, args) => {
	const deckCollection = CollectionOf<Memento.Deck>(`users/${userId}/courses/${args.courseId}/decks`);
	await deckCollection.doc(args.deckId).update({ name: args.name, public: args.public });

	return ok({ id: args.deckId });
});
