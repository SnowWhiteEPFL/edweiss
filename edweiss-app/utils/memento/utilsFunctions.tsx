import Memento from '@/model/memento';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export const sortingCards = (cards: Memento.Card[]) => {
    return [...cards].sort((a, b) => {
        if (a.learning_status === "Not yet" && b.learning_status !== "Not yet") return -1;
        if (a.learning_status !== "Not yet" && b.learning_status === "Not yet") return 1;
        return 0;
    });
};

export const getStatusColor = (status: string) => {
    switch (status) {
        case "Not yet":
            return "red";
        case "Got it":
            return "green";
    }
};

export const handlePress = (card: Memento.Card, selectionMode: boolean, goToPath: () => void, toggleSelection: (card: Memento.Card) => void) => {
    if (!selectionMode) {
        goToPath();
    } else {
        toggleSelection(card); // Select or deselect
    }
};

// Move this function outside the CardListScreen component
export const handleCardPress = (
    index: number,
    selectionMode: boolean,
    selectedCardIndex: number | null,
    setSelectedCardIndex: (index: number | null) => void,
    modalRef: React.RefObject<BottomSheetModal> // Update ModalType to your modal's type
) => {
    if (!selectionMode) {
        // Open the modal with the selected card
        if (selectedCardIndex === index) {
            // If the card is already selected, close the modal
            modalRef.current?.dismiss();
            setSelectedCardIndex(null);
        } else {
            setSelectedCardIndex(index); // Set the new selected card index
            modalRef.current?.present(); // Show the modal
        }
    }
};
