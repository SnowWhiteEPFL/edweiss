import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction, Collections } from '@/config/firebase';
import t from '@/config/i18config';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router } from 'expo-router';
import React, { useState } from 'react';

const DeckScreen: ApplicationRoute = () => {
    const [deckName, setDeckName] = useState("");
    const [existedDeckName, setExistedDeckName] = useState(false);
    const [selectedDecks, setSelectedDecks] = useState<Memento.Deck[]>([]);
    const [selectionMode, setSelectionMode] = useState(false); // Track selection mode

    const decks = useDynamicDocs(Collections.deck);

    async function call() {
        const trimmedDeckName = deckName.trim();

        if (trimmedDeckName.length == 0 || existedDeckName)
            return;

        const isDuplicate = decks?.some(deck => deck.data.name === trimmedDeckName);
        if (isDuplicate) {
            setExistedDeckName(true);
            return;  // Prevent creation if a duplicate is found
        }

        try {
            const res = await callFunction(Memento.Functions.createDeck, {
                deck: {
                    name: deckName,
                    cards: []
                }
            });

            if (res.status === 1) {
                console.log(`OKAY, deck created with id ${res.data.id}`);
                setDeckName(""); // Clear the input field after successful creation
            }
        } catch (error) {
            console.error("Failed to create deck:", error);
            // Optionally, set an error state to inform the user
        }
    }

    const toggleDeckSelection = (deck: Memento.Deck) => {
        const index = selectedDecks.findIndex(selected => selected.name === deck.name); // Find index of the selected deck

        setSelectedDecks(prev =>
            index >= 0
                ? prev.filter(selected => selected.name !== deck.name) // Remove from selection
                : [...prev, deck] // Add to selection
        );

        // Exit selection mode immediately if all decks are deselected
        if (index >= 0 && selectedDecks.length === 1) {
            setSelectionMode(false);  // Exit selection mode when the last deck is deselected
        }
    };

    const deleteSelectedDecks = async () => {
        if (selectedDecks.length === 0) return;

        // Logic to delete the selected decks
        await Promise.all(selectedDecks.map(deck =>
            callFunction(Memento.Functions.deleteDeck, {
                deckId: decks?.filter(d => d.data.name === deck.name)[0].id
            })
        ));
        setSelectedDecks([]); // Clear selection after deletion
        setSelectionMode(false); // Exit selection mode
    };

    const cancelSelection = () => {
        setSelectedDecks([]); // Clear selection
        setSelectionMode(false); // Exit selection mode
    };

    const enterSelectionMode = () => {
        setSelectionMode(true); // Activate selection mode on long press
    };

    return (
        <>
            <RouteHeader title={"Decks"} />

            <TScrollView>

                <FancyTextInput
                    value={deckName}
                    onChangeText={n => {
                        setDeckName(n);
                        setExistedDeckName(false);
                    }}
                    placeholder='My amazing deck'
                    icon='dice'
                    label='Deck name'
                    error={existedDeckName ? 'This name has already been used' : undefined}
                    multiline
                    numberOfLines={3}
                />

                <FancyButton backgroundColor='blue' mt={'md'} mb={'sm'} onPress={call} icon='logo-firebase'>
                    {t("memento:create-deck")}
                </FancyButton>

                {selectedDecks.length > 0 && (
                    <TView mt={'md'} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <FancyButton
                            backgroundColor='red'
                            onPress={deleteSelectedDecks}
                            mb={'sm'}
                            style={{ flex: 1 }}
                        >
                            Delete Selected Deck
                        </FancyButton>

                        <FancyButton
                            backgroundColor='blue'
                            onPress={cancelSelection}
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </FancyButton>
                    </TView>
                )}

                <For each={decks}>
                    {deck =>
                        <DeckDisplay
                            key={deck.id}
                            deck={deck.data}
                            id={deck.id}
                            isSelected={selectedDecks.some(selected => selected.name === deck.data.name)}
                            toggleSelection={toggleDeckSelection}
                            onLongPress={enterSelectionMode}
                            selectionMode={selectionMode}
                        />}
                </For>
            </TScrollView>
        </>
    );
};

export default DeckScreen;

export const DeckDisplay: ReactComponent<{ deck: Memento.Deck, id: string; isSelected: boolean; toggleSelection: (deck: Memento.Deck) => void; onLongPress: () => void; selectionMode: boolean; }> = ({ deck, id, isSelected, toggleSelection, onLongPress, selectionMode }) => {
    const handlePress = () => {
        if (!selectionMode) {
            router.push(`/deck/${id}`);
        } else {
            toggleSelection(deck);  // Only toggle selection if we're in selection mode
        }
    };

    return (
        <TTouchableOpacity bb={0}
            onLongPress={() => {
                onLongPress();
                toggleSelection(deck);
            }}
            onPress={handlePress}
            m='md' mt={'sm'} mb={'sm'} p='lg'
            backgroundColor={isSelected ? 'rosewater' : 'base'}
            borderColor='crust' radius='lg'
        >
            <TText bold>
                {deck.name}
            </TText>
            <TText mb='md' color='subtext0' size={'sm'}>
                2h ago
            </TText>
            {isSelected && <TText color='green'>✓</TText>}
        </TTouchableOpacity>
    );
};