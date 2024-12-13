/**
 * @file utilsFunctions.tsx
 * @description Utility functions for Memento
 * @author Tuan Dang Nguyen
 */

import { CollectionOf } from '@/config/firebase';
import { Color } from '@/constants/Colors';
import { IconType } from '@/constants/Style';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { AppUser, UserID } from '@/model/users';

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

/**
 * mementoStatusIconMap
 * 
 * @param {Memento.LearningStatus} - Learning status
 * 
 * @returns {IconType} - Icon type of the status
 */
export const mementoStatusIconMap: Record<Memento.LearningStatus, IconType> = {
    "Not yet": "alert-circle",
    "Got it": "checkmark-done-circle"
};

/**
 * mementoStatusColorMap
 * 
 * @param {Memento.LearningStatus} - Learning status
 * 
 * @returns {Color} - Color of the status
 */
export const mementoStatusColorMap: Record<Memento.LearningStatus, Color> = {
    "Not yet": "red",
    "Got it": "green"
};

/**
 * 
 * @param {boolean} isDupplicate - Check if the question is duplicated
 * @param {boolean} isEmptyField - Check if the question field is empty
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setExistedQuestion - Set the state of the question existence
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setEmptyField - Set the state of the empty field
 * @param {React.Dispatch<React.SetStateAction<boolean>>} setIsLoading - Set the state of the loading status
 * 
 * @returns {number} - 0 if the question is duplicated or the field is empty, 1 otherwise
 */
export const checkDupplication_EmptyField = (
    isDupplicate: boolean,
    isEmptyField: boolean,
    setExistedQuestion: (value: React.SetStateAction<boolean>) => void,
    setEmptyField: (value: React.SetStateAction<boolean>) => void,
) => {
    if (isDupplicate) {
        setExistedQuestion(true);
        if (isEmptyField) setEmptyField(true);
        return 0;  // Prevent creation if a duplicate is found
    }

    if (isEmptyField) {
        setEmptyField(true);
        return 0;
    }

    return 1;
};

export const selectedCardIndices_play = (selectedCards: Memento.Card[], cards: Memento.Card[]) => {
    return selectedCards.length > 0
        ? selectedCards.map(card => cards.indexOf(card)) // Get indices of selected cards
        : Array.from(cards.keys()); // Use indices of all cards if none are
};

export const userIdToName = (userId: UserID) => {
    const users = useDynamicDocs(CollectionOf<AppUser>('users'));
    if (!users) return undefined;

    // For each users, map user.id to user.data.name
    const ids_names_map = new Map<string, string>();
    users.forEach(user => {
        ids_names_map.set(user.id, user.data.name);
    });

    return ids_names_map.get(userId);
}
