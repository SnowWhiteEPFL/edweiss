import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { CollectionOf } from 'utils/firestore';
import { ok } from 'utils/status';

export const createCard = onAuthentifiedCall(Memento.Functions.createCard, async (userId, args) => {

    const deckCollection = CollectionOf<Memento.Deck>("decks");
    const deckDoc = await deckCollection.doc(args.deckId).get();
    const deckData = deckDoc.data();

    const updatedCards = deckData?.cards ? [...deckData.cards, args.card] : [args.card];
    await deckCollection.doc(args.deckId).update({ cards: updatedCards });

    /*
    const deck = getDocument(CollectionOf<Memento.Deck>("decks"), args.deckId);

    deck.then((deck) => { deck?.cards.push(args.card); }, (err) => { return fail(err); });
    */
    return ok({ id: args.deckId });
});
