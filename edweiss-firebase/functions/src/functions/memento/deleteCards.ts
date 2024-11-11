import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const deleteCard = onAuthentifiedCall(Memento.Functions.deleteCards, async (userId, args) => {

    const deckCollection = CollectionOf<Memento.Deck>("decks");
    const deckDoc = await deckCollection.doc(args.deckId).get();
    const deckData = deckDoc.data();

    if (deckData?.cards) {
        // Filter out the cards to be deleted using the cardIndices
        const updatedCards = deckData.cards.filter((_, index) => !args.cardIndices.includes(index));

        // Update the deck with the new array of cards
        await deckCollection.doc(args.deckId).update({ cards: updatedCards });

        return ok({ id: args.deckId });
    } else {
        // If there are no existing cards, return an error
        return fail("deck_not_found");
    }
});
