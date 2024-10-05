
import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const createDeck = onAuthentifiedCall(Memento.Functions.creation.createDeck, async (userId, args) => {
	if (args.deck.cards.length == 0)
		return fail("empty_deck");

	const deckCollection = CollectionOf<Memento.Deck>("decks");

	const res = await deckCollection.add(args.deck);

	return ok({ id: res.id });
});
