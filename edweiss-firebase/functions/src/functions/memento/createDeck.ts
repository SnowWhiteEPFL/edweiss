import Memento from 'model/memento';
import { CustomPredicateMemento } from 'utils/custom-sanitizer/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const createDeck = onSanitizedCall(Memento.Functions.createDeck, {
	deck: Predicate.fields({
		name: Predicate.isNonEmptyString,
		cards: Predicate.forEach(CustomPredicateMemento.isValidCard)
	}),
	courseId: Predicate.isNonEmptyString
}, async (userId, args) => {
	//const deckCollection = CollectionOf<Memento.Deck>("decks");
	const deckCollection = CollectionOf<Memento.Deck>(`courses/${args.courseId}/decks`);

	const res = await deckCollection.add(args.deck);

	return ok({ id: res.id });
});
