import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { ok } from 'utils/status';

export const createDeck = onAuthentifiedCall(Memento.Functions.createDeck, async (userId, args) => {

	const deckCollection = CollectionOf<Memento.Deck>("decks");

	const res = await deckCollection.add(args.deck);

	return ok({ id: res.id });
});
