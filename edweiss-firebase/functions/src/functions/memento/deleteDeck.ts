import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const deleteDeck = onSanitizedCall(Memento.Functions.deleteDeck, {
	deckId: Predicate.isNonEmptyString
}, async (userId, args) => {
	const deckCollection = CollectionOf<Memento.Deck>("decks");

	await deckCollection.doc(args.deckId).delete();

	return ok({ id: args.deckId });
});
