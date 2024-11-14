import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { ok } from 'utils/status';

export const deleteDecks = onSanitizedCall(Memento.Functions.deleteDecks, {
    deckIds: Predicate.isNonEmptyArray
}, async (userId, args) => {
    const deckCollection = CollectionOf<Memento.Deck>("decks");
    for (const deckId of args.deckIds) {
        await deckCollection.doc(deckId).delete();
    }

    return ok({ id: "Decks Deleted" });
});
