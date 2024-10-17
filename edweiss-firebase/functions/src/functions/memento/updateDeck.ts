import Memento from 'model/memento';
import { onAuthentifiedCall } from 'utils/firebase';
import { ok } from 'utils/status';

export const updateDeck = onAuthentifiedCall(Memento.Functions.updateDeck, async (userId, args) => {

    /*
    For future implementation
    */

    return ok({ id: args.deckId });
});
