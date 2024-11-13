import Memento from 'model/memento';
import { CustomPredicateMemento } from 'utils/custom-sanitizer/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate, assertThatFields } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const createDeck = onAuthentifiedCall(Memento.Functions.createDeck, async (userId, args) => {
	assertThatFields(args.deck, {
		name: Predicate.isNonEmptyString,
		cards: Predicate.forEach(CustomPredicateMemento.isValidCard)
	})

	const deckCollection = CollectionOf<Memento.Deck>("decks");

	const res = await deckCollection.add(args.deck);

	return ok({ id: res.id });
});
