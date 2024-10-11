import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { ok } from 'utils/status';

export const createCard = onAuthentifiedCall(Memento.Functions.createCard, async (userId, args) => {

    const deckCollection = CollectionOf<Memento.Deck>("decks");
    const deckDoc = await deckCollection.doc(args.deckId).get();
    const deckData = deckDoc.data();

    if (deckData && deckData.cards) {
        // Append the new card to the existing cards array
        const updatedCards = [...deckData.cards, args.card];

        // Update the deck with the new array of cards
        await deckCollection.doc(args.deckId).update({ cards: updatedCards });
    } else {
        // If there are no existing cards, create a new array with the new card
        await deckCollection.doc(args.deckId).update({ cards: [args.card] });
    }

    /*
    const deck = getDocument(CollectionOf<Memento.Deck>("decks"), args.deckId);

    deck.then((deck) => { deck?.cards.push(args.card); }, (err) => { return fail(err); });
    */
    return ok({ id: args.deckId });
});
