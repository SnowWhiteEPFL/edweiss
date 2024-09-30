
export type CardQuestionType = "text";

export interface CardQuestionText {
	type: "text",
	text: string
}

export type CardQuestion = CardQuestionText;

export interface Card {
	question: CardQuestion,
	answer: string
}

export interface Deck {
	name: string,
	cards: Card[]
}
