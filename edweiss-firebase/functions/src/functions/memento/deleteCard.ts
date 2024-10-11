import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { fail, ok } from 'utils/status';

export const deleteCard = onAuthentifiedCall(Memento.Functions.deleteCard, async (userId, args) => {

    const deckCollection = CollectionOf<Memento.Deck>("decks");
    const deckDoc = await deckCollection.doc(args.deckId).get();
    const deckData = deckDoc.data();

    if (deckData && deckData.cards) {
        // Append the new card to the existing cards array
        const updatedCards = deckData?.cards.filter((card, index) => index !== args.cardIndex);

        // Update the deck with the new array of cards
        await deckCollection.doc(args.deckId).update({ cards: updatedCards });

        return ok({ id: args.deckId });
    } else {
        // If there are no existing cards, create a new array with the new card
        return fail("deck_not_found");
    }
});
