import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { assertNonEmptyString } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const deleteDeck = onAuthentifiedCall(Memento.Functions.deleteDeck, async (userId, args) => {
	assertNonEmptyString(args.deckId);

	const deckCollection = CollectionOf<Memento.Deck>("decks");

	await deckCollection.doc(args.deckId).delete();

	return ok({ id: args.deckId });
});
