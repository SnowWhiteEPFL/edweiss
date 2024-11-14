import Memento from 'model/memento';
import { Predicate } from 'utils/sanitizer';

export namespace CustomPredicateMemento {

	export const isValidCard: Predicate<Memento.Card> =
		Predicate.fields({
			answer: Predicate.isNonEmptyString,
			question: Predicate.isNonEmptyString,
			learning_status: Predicate.isOptional(Predicate.isIn(["Got it", "Not yet"] as const))
		})

}
