/**
 * Memento is a flashcard app. It allows users to create decks of flashcards, each with a question and an answer.
 * Users can mark their learning status for each card as "Got it" or "Not yet".
 * 
 * @file memento.ts
 * @description Module for managing flashcards in the edweiss app	
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { FunctionFolder, FunctionOf } from './functions';

// ------------------------------------------------------------
// ---------------------  Memento Namespace  ------------------
// ------------------------------------------------------------
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

	export type LearningStatus = "Got it" | "Not yet";

	export interface Deck {
		name: string,
		cards: Card[];
	}

	/**
	 * Functions for managing flashcards in the edweiss app
	 */
	export const Functions = FunctionFolder("memento", {
		createDeck: FunctionOf<{ deck: Memento.Deck; }, { id: string; }, 'empty_deck'>("createDeck"),
		deleteDecks: FunctionOf<{ deckIds: string[]; }, { id: string; }, 'deck_not_found'>("deleteDecks"),
		createCard: FunctionOf<{ deckId: any; card: Memento.Card; }, { id: string; }, 'deck_not_found'>("createCard"),
		updateDeck: FunctionOf<{ deckId: any; name: string; }, { id: string; }, 'deck_not_found'>("updateDeck"),
		updateCard: FunctionOf<{ deckId: any; newCard: Memento.Card; cardIndex: number; }, { id: string; }, {}>("updateCard"),
		deleteCards: FunctionOf<{ deckId: any; cardIndices: number[]; }, { id: string; }, 'card_not_found'>("deleteCards"),
	});

}

export default Memento;
