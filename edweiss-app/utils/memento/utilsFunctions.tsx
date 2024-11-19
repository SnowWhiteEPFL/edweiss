/**
 * @file utilsFunctions.tsx
 * @description Utility functions for Memento
 * @author Tuan Dang Nguyen
 */

import Memento from '@/model/memento';

/**
 * sortingCards
 * 
 * @param {Memento.Card[]} cards - List of cards
 * 
 * @returns {Memento.Card[]} - Sorted list of cards based on learning status 
 */
export const sortingCards = (cards: Memento.Card[]) => {
    return [...cards].sort((a, b) => {
        if (a.learning_status === "Not yet" && b.learning_status !== "Not yet") return -1;
        if (a.learning_status !== "Not yet" && b.learning_status === "Not yet") return 1;
        return 0;
    });
};

/**
 * getStatusColor
 * 
 * @param {string} status - Learning status
 * 
 * @returns {string} - Color of the status 
 */
export const getStatusColor = (status: string) => {
    switch (status) {
        case "Not yet":
            return "red";
        case "Got it":
            return "green";
    }
};
