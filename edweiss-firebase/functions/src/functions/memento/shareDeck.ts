import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const shareDeck = onSanitizedCall(Memento.Functions.shareDeck, {
    deckId: Predicate.isNonEmptyString,
    other_user: Predicate.isNonEmptyString,
    courseId: Predicate.isNonEmptyString
}, async (userId, args) => {
    const my_deckCollection = CollectionOf<Memento.Deck>(`users/${userId}/courses/${args.courseId}/decks`);
    const other_deckCollection = CollectionOf<Memento.Deck>(`users/${args.other_user}/courses/${args.courseId}/decks`);

    const shared_deckDoc = await my_deckCollection.doc(args.deckId).get();
    const shared_deck = shared_deckDoc.data();

    if (!shared_deck) {
        return fail("deck_not_found");
    }

    // If there is a deck with the same name and the same ownerID[0] == userId, if yes, only update the cards instance
    const other_deckDoc = await other_deckCollection.where("name", "==", shared_deck.name).where("ownerID", "array-contains", args.other_user).get();
    if (other_deckDoc.size > 0) {
        const other_deck = other_deckDoc.docs[0].data();
        const updated_deck = { ...other_deck, cards: shared_deck.cards };
        await other_deckCollection.doc(other_deckDoc.docs[0].id).update(updated_deck);
        return ok({ id: other_deckDoc.docs[0].id });
    }

    const shared_deck_with_added_owner = { ...shared_deck, ownerID: [...shared_deck.ownerID, args.other_user] };

    const res = await other_deckCollection.add(shared_deck_with_added_owner);

    return ok({ id: res.id });
});