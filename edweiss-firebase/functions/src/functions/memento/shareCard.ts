import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const shareCard = onSanitizedCall(Memento.Functions.shareCard, {
    deckId: Predicate.isNonEmptyString,
    card: Predicate.fields({
        ownerID: Predicate.isNonEmptyString,
        answer: Predicate.isNonEmptyString,
        question: Predicate.isNonEmptyString,
        learning_status: Predicate.isOptional(Predicate.isIn(["Got it", "Not yet"] as const))
    }),
    other_user: Predicate.isNonEmptyString,
    courseId: Predicate.isNonEmptyString
}, async (userId, args) => {

    const my_deckCollection = CollectionOf<Memento.Deck>(`users/${userId}/courses/${args.courseId}/decks`);
    const other_deckCollection = CollectionOf<Memento.Deck>(`users/${args.other_user}/courses/${args.courseId}/decks`);

    const my_deckDoc = await my_deckCollection.doc(args.deckId).get();
    const my_deck = my_deckDoc.data();

    if (!my_deck) {
        return fail("deck_not_found");
    }

    // If other has the same deck (check with deck.name) then add the card to the other deck
    const other_deckDoc = await other_deckCollection.where("name", "==", my_deck.name).get();
    if (other_deckDoc.size > 0) {
        const other_deck = other_deckDoc.docs[0].data();
        const other_cards = other_deck.cards;

        // Check if the other deck already has the same card (check with card.question and card.ownerID) then don't add
        if (other_cards.some(other_card => other_card.question === args.card.question && other_card.ownerID === args.card.ownerID)) {
            return ok({ id: other_deckDoc.docs[0].id });
        }

        const updated_cards = [...other_cards, args.card];

        await other_deckCollection.doc(other_deckDoc.docs[0].id).update({ cards: updated_cards });

        return ok({ id: other_deckDoc.docs[0].id });
    }

    // If other doesn't have the same deck, then add the deck with that 1 args.card to the other user
    const shared_deck = { ...my_deck, ownerID: [...my_deck.ownerID, args.other_user], cards: [args.card] };
    await other_deckCollection.add(shared_deck);

    return ok({ id: "shareCard" });
});