import Memento from 'model/memento';
import { CustomPredicateMemento } from 'utils/custom-sanitizer/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { assertNonEmptyString, assertPositiveNumber, assertThat } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const updateCard = onAuthentifiedCall(Memento.Functions.updateCard, async (userId, args) => {
	assertPositiveNumber(args.cardIndex);
	assertNonEmptyString(args.deckId);
	assertThat(args.newCard, CustomPredicateMemento.isValidCard);

	const deckCollection = CollectionOf<Memento.Deck>("decks");
	const deckDoc = await deckCollection.doc(args.deckId).get();
	const cards = deckDoc.data()?.cards;
	const new_cards = cards?.map((card, index) =>
		index === args.cardIndex ? args.newCard : card
	);

	await deckCollection.doc(args.deckId).update({ cards: new_cards });

	return ok({ id: args.deckId });
});
