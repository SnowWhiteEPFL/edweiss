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
		learning_status: LearningStatus;
	}

	export type LearningStatus = "Got it" | "Not yet" | undefined;

	export interface Deck {
		name: string,
		cards: Card[];
	}

	export const createDeck = FunctionFolder("memento", {
		creation: FunctionFolder("creation", {
			createDeck: FunctionOf<{ deck: Memento.Deck; }, { id: string; }, 'empty_deck'>("createDeck"),
		})
	});

	export const deleteDeck = FunctionFolder("memento", {
		deletion: FunctionFolder("deletion", {
			deleteDeck: FunctionOf<{ deckId: string; }, { id: string; }, 'deck_not_found'>("deleteDeck"),
		})
	});

	export const createCard = FunctionFolder("memento", {
		creation: FunctionFolder("creation", {
			createCard: FunctionOf<{ deckId: any; card: Memento.Card; }, { id: string; }, 'deck_not_found'>("createCard"),
		})
	});

	export const deleteCard = FunctionFolder("memento", {
		deletion: FunctionFolder("deletion", {
			deleteCard: FunctionOf<{ deckId: string; cardId: string; }, { id: string; }, 'deck_not_found'>("deleteCard"),
		})
	});

	export const updateDeck = FunctionFolder("memento", {
		update: FunctionFolder("update", {
			updateDeck: FunctionOf<{ deckId: any; card: Memento.Card; }, { id: string; }, 'deck_not_found'>("updateDeck"),
		})
	});
}

export default Memento;
