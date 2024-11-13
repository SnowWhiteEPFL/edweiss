import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const deleteCard = onSanitizedCall(Memento.Functions.deleteCard, {
	cardIndex: Predicate.isPositive,
	deckId: Predicate.isNonEmptyString
}, async (userId, args) => {
	const deckCollection = CollectionOf<Memento.Deck>("decks");
	const deckDoc = await deckCollection.doc(args.deckId).get();
	const deckData = deckDoc.data();

	if (deckData?.cards) {
		// Filter out the card to be deleted using the cardIndex
		const updatedCards = deckData.cards.filter((_, index) => index !== args.cardIndex);

		// Update the deck with the new array of cards
		await deckCollection.doc(args.deckId).update({ cards: updatedCards });

		return ok({ id: args.deckId });
	} else {
		// If there are no existing cards, return an error
		return fail("deck_not_found");
	}
});
