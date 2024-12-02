import Memento from '@/model/memento';
import { selectedCardIndices_play, sortingCards } from '@/utils/memento/utilsFunctions';

// Mock cards
const card1: Memento.Card = {
    question: 'Question 1',
    answer: 'Answer 1',
    learning_status: 'Got it',
};

const card2: Memento.Card = {
    question: 'Question 2',
    answer: 'Answer 2',
    learning_status: 'Not yet',
};

const card3: Memento.Card = {
    question: 'Question 3',
    answer: 'Answer 3',
    learning_status: 'Got it',
};

describe('selected card indices to play', () => {
    it('should return the correct indices of selected cards', () => {
        const cards = [card1, card2, card3];
        const selectedCards = [card1, card3];
        const selectedCardIndices_to_play = selectedCardIndices_play(selectedCards, cards)
        expect(selectedCardIndices_to_play).toEqual([0, 2]);
    });
});

describe('sorting cards', () => {
    it('should return the correct sorted list of cards', () => {
        const cards = [card1, card2, card3];
        const sortedCards = sortingCards(cards);
        expect(sortedCards).toEqual([card2, card1, card3]);
    });
});