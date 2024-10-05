import { FunctionFolder, FunctionOf } from './functions';

namespace Memento {
	export type CardQuestionType = "text";

	export interface CardQuestionText {
		type: "text",
		text: string;
	}

	export type CardQuestion = CardQuestionText;

	export interface Card {
		question: CardQuestion,
		answer: string;
	}

	export interface Deck {
		name: string,
		cards: Card[];
	}

	export const Functions = FunctionFolder("memento", {
		creation: FunctionFolder("creation", {
			createDeck: FunctionOf<{ deck: Memento.Deck; }, { id: string; }, 'empty_deck'>("createDeck"),
		})
	});
}

export default Memento;
