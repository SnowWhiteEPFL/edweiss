import Memento from 'model/memento';
import { AppUser } from 'model/users';
import { onSanitizedCall } from 'utils/firebase';
import { CollectionOf, getRequiredDocument } from 'utils/firestore';
import { Predicate } from 'utils/sanitizer';
import { fail, ok } from 'utils/status';

export const shareDeck = onSanitizedCall(Memento.Functions.shareDeck, {
    deckId: Predicate.isNonEmptyString,
    other_user: Predicate.isNonEmptyString,
    courseId: Predicate.isNonEmptyString
}, async (userId, args) => {
    const my_deckCollection = CollectionOf<Memento.Deck>(`users/${userId}/courses/${args.courseId}/decks`);
    const other_deckCollection = CollectionOf<Memento.Deck>(`users/${args.other_user}/courses/${args.courseId}/decks`);

    const current_user = await getRequiredDocument(CollectionOf<AppUser>('users'), userId, { error: "user_not_found", status: 0 });
    const other_user = await getRequiredDocument(CollectionOf<AppUser>('users'), args.other_user, { error: "user_not_found", status: 0 });

    const my_deckDoc = await my_deckCollection.doc(args.deckId).get();
    let my_deck = my_deckDoc.data();

    if (!my_deck) {
        return fail("deck_not_found");
    }

    // If there is a deck with the same name and the same ownerID[0] == userId, if yes, only update the cards instance
    const other_deckDoc_with_same_name = await other_deckCollection.where("name", "==", my_deck.name)
    const other_deckDoc = await other_deckDoc_with_same_name.where("ownerID", "array-contains", userId).get();
    if (other_deckDoc.size > 0) {
        const other_deck = other_deckDoc.docs[0].data();
        const other_cards = other_deck.cards;

        // If the other deck already has the same cards untouched (== didn't change question || answer) then only add new cards
        // This allows the user to share the deck with the same user multiple times without duplicating the cards
        // and also other to have 2 same questions but might have different answers
        const cards_to_add = my_deck.cards.filter(card => !other_cards.some(other_card => other_card.question === card.question && other_card.ownerID === card.ownerID));
        const updated_cards = [...other_cards, ...cards_to_add];

        await other_deckCollection.doc(other_deckDoc.docs[0].id).update({ cards: updated_cards });

        return ok({ id: other_deckDoc.docs[0].id });
    }

    // If other_deckDoc_with_same_name.get().size > 0, then modify name of my_deck to be unique
    if ((await other_deckDoc_with_same_name.get()).size > 0) {
        const new_name = my_deck.name + " (shared)";
        my_deck.name = new_name;
    }

    // If other user is not already in the ownerID array, add the other user to the ownerID array but
    // If current user is the professor, other user is the student then don't add the other user (student) to the ownerID array
    // Because the student is not allowed to edit the deck
    if (current_user.type === "professor" && other_user.type === "student") {
        // Do nothing ???
    }
    else
        if (!my_deck.ownerID.includes(args.other_user)) {
            await my_deckCollection.doc(args.deckId).update({ ownerID: [...my_deck.ownerID, args.other_user] });
            my_deck = { ...my_deck, ownerID: [...my_deck.ownerID, args.other_user] };
        }
    //await my_deckCollection.doc(args.deckId).update({ ownerID: [...my_deck.ownerID, args.other_user] });

    const shared_deck_with_added_owner = { ...my_deck };

    const res = await other_deckCollection.add(shared_deck_with_added_owner);

    return ok({ id: res.id });
});