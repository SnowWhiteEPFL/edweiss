import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { ok } from 'utils/status';

export const deleteDecks = onAuthentifiedCall(Memento.Functions.deleteDecks, async (userId, args) => {

    const deckCollection = CollectionOf<Memento.Deck>("decks");
    for (const deckId of args.deckIds) {
        await deckCollection.doc(deckId).delete();
    }

    return ok({ id: "Decks Deleted" });
});
