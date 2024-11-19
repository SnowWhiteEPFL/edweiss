/**
 * Edit card screen
 * User can edit a card with a question and an answer
 * 
 * @file index.tsx
 * @description Screen to edit a card with a question and an answer
 * @author Tuan Dang Nguyen
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction, Collections } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';

// ------------------------------------------------------------
// ----------------- EditCardScreen Component -----------------
// ------------------------------------------------------------

/**
 * Edit card screen
 * User can edit a card with a question and an answer
 * 
 * @returns {ApplicationRoute} Screen to edit a card
 */
const EditCardScreen: ApplicationRoute = () => {
    const { deckId, prev_question, prev_answer, cardIndex } = useLocalSearchParams();
    const [question, setQuestion] = useState(prev_question as string);
    const [answer, setAnswer] = useState(prev_answer as string);
    const [existedQuestion, setExistedQuestion] = useState(false);
    const [emptyField, setEmptyField] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const decks = useDynamicDocs(Collections.deck);

    const deck = decks?.find(d => d.id == deckId);
    const cardIndexInt = cardIndex ? parseInt(cardIndex.toString()) : 0;

    const card = deck?.data.cards[cardIndexInt];

    // Update a card with a new question and answer
    async function updateCard(new_Question: string, new_Answer: string) {

        const isDuplicate = deck?.data.cards.some(card => card.question === new_Question) && new_Question != prev_question;
        const isEmpty = new_Question.length == 0 || new_Answer.length == 0;

        if (isDuplicate) {
            setExistedQuestion(true);
            setIsLoading(false);
            if (isEmpty) setEmptyField(true);
            return;  // Prevent creation if a duplicate is found
        }

        if (isEmpty) {
            setEmptyField(true);
            setIsLoading(false);
            return;
        }

        const res = await callFunction(Memento.Functions.updateCard, { deckId: deckId as any, newCard: { ...card, question: new_Question, answer: new_Answer }, cardIndex: cardIndexInt });

        if (res.status == 1) {
            console.log(`OKAY, card updated with index ${cardIndexInt}`);
            setIsLoading(false);
            router.back();
        }

    }

    return (
        <>
            <RouteHeader title='Edit card' />

            <TScrollView>
                {/* <TextInput value={deckName} onChangeText={n => setDeckName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ backgroundColor: Colors.dark.crust, borderColor: Colors.dark.blue, borderWidth: 1, padding: 8, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'white', borderRadius: 14, fontFamily: "Inter" }}>

				</TextInput> */}
                <TView testID='questionInput' m='md' borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={question}
                        onChangeText={n => {
                            setQuestion(n)
                            setExistedQuestion(false)
                            setEmptyField(false)
                        }}
                        placeholder='My amazing question'
                        icon='help-sharp'
                        label='Question'
                        error={existedQuestion ? 'Question already exists' : emptyField ? 'Please fill in all fields' : undefined}
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <TView m='md' mt={2} borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={answer}
                        onChangeText={n => {
                            setAnswer(n)
                            setEmptyField(false)
                        }}
                        placeholder='My amazing answer'
                        icon='bulb-outline'
                        label='Answer'
                        error={emptyField ? 'Please fill in all fields' : undefined}
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <FancyButton
                    testID='updateCardButton'
                    loading={isLoading}
                    onPress={() => {
                        setIsLoading(true);
                        updateCard(question, answer)
                    }
                    }
                    backgroundColor='blue' mt={'md'} mb={'sm'} icon='logo-firebase' mx={300}
                >
                    Done!
                </FancyButton>

            </TScrollView >
        </>
    );
};

export default EditCardScreen;
