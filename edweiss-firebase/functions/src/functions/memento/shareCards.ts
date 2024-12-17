import Memento from 'model/memento';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const shareCards = onSanitizedCall(Memento.Functions.shareCards, {
    deckId: Predicate.isNonEmptyString,
    cardIndices: Predicate.isNonEmptyArray,
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

    const my_cards = my_deck.cards.filter((_, index) => args.cardIndices.includes(index));

    // Find recipient's deck with the same name
    const other_deckDoc = await other_deckCollection.where("name", "==", my_deck.name).get();

    if (other_deckDoc.size > 0) {
        const other_deck = other_deckDoc.docs[0].data();
        const other_cards = other_deck.cards;

        // Filter cards to exclude duplicates
        const newCards = my_cards.filter(card =>
            !other_cards.some(other_card => other_card.question === card.question && other_card.ownerID === card.ownerID)
        );

        // If no new cards to add, return success with existing deck ID
        if (newCards.length === 0) {
            return ok({ id: other_deckDoc.docs[0].id });
        }

        // Adjust questions for duplicates in the deck
        const updatedCards = newCards.map(card => {
            const isDuplicateQuestion = other_cards.some(other_card => other_card.question === card.question);
            return {
                ...card,
                question: isDuplicateQuestion ? `${card.question} (shared)` : card.question
            };
        });

        // Update the recipient's deck with new cards
        await other_deckCollection.doc(other_deckDoc.docs[0].id).update({
            cards: [...other_cards, ...updatedCards]
        });

        return ok({ id: other_deckDoc.docs[0].id });
    }

    // If no matching deck exists, create a new one
    const shared_deck = {
        ...my_deck,
        ownerID: [...my_deck.ownerID, args.other_user],
        cards: my_cards
    };
    await other_deckCollection.add(shared_deck);

    // Update the ownerID array in the sender's deck
    await my_deckCollection.doc(args.deckId).update({
        ownerID: [...my_deck.ownerID, args.other_user]
    });

    return ok({ id: "shareCards" });
});
