import Functions from '../../model/functions';
import { Deck } from '../../model/memento';
import { onAuthentifiedCall } from '../../utils/firebase';
import { CollectionOf } from '../../utils/firestore';
import { fail, ok } from '../../utils/status';

export const createDeck = onAuthentifiedCall(Functions.createDeck, async (userId, args) => {
	if (args.deck.cards.length == 0)
		return fail("empty_deck");

	const deckCollection = CollectionOf<Deck>("decks");

	const res = await deckCollection.add(args.deck);

	return ok({ id: res.id });
});
