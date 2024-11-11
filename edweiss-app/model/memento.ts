import { FunctionFolder, FunctionOf } from './functions';

namespace Memento {
	export type CardQuestionType = "text";

	export interface CardQuestionText {
		type: "text",
		text: string;
	}

	export type CardQuestion = CardQuestionText;

	export interface Card { // For an image, we could have a URL
		question: string, // For now, just a string
		answer: string;
		learning_status: LearningStatus;
	}

	export type LearningStatus = "Got it" | "Not yet" | undefined;

	export interface Deck {
		name: string,
		cards: Card[];
	}

	export const Functions = FunctionFolder("memento", {
		createDeck: FunctionOf<{ deck: Memento.Deck; }, { id: string; }, 'empty_deck'>("createDeck"),
		deleteDeck: FunctionOf<{ deckId: string; }, { id: string; }, 'deck_not_found'>("deleteDeck"),
		createCard: FunctionOf<{ deckId: any; card: Memento.Card; }, { id: string; }, 'deck_not_found'>("createCard"),
		deleteCard: FunctionOf<{ deckId: string; cardIndex: number; }, { id: string; }, 'deck_not_found'>("deleteCard"),
		updateDeck: FunctionOf<{ deckId: any; card: Memento.Card; }, { id: string; }, 'deck_not_found'>("updateDeck"),
		updateCard: FunctionOf<{ deckId: any; newCard: Memento.Card; cardIndex: number; }, { id: string; }, {}>("updateCard"),
		deleteCards: FunctionOf<{ deckId: any; cardIndices: number[]; }, { id: string; }, 'card_not_found'>("deleteCards"),
	});

}

export default Memento;
