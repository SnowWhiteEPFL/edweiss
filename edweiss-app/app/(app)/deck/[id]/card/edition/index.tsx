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

const EditCardScreen: ApplicationRoute = () => {
    const { deckId, prev_question, prev_answer, cardIndex } = useLocalSearchParams();
    const [question, setQuestion] = useState(prev_question as string);
    const [answer, setAnswer] = useState(prev_answer as string);

    const decks = useDynamicDocs(Collections.deck);
    const deck = decks?.find(d => d.id == deckId);
    const cardIndexInt = parseInt(cardIndex.toString());

    const card = deck?.data.cards[cardIndexInt];

    async function updateCard() {

        const res = await callFunction(Memento.Functions.updateCard, { deckId: deckId as any, newCard: card, cardIndex: cardIndexInt });

        if (res.status == 1) {
            console.log(`OKAY, card updated with index ${cardIndexInt}`);
            router.back();
        }

    }

    return (
        <>
            <RouteHeader title='Edit card' />

            <TScrollView>
                {/* <TextInput value={deckName} onChangeText={n => setDeckName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ backgroundColor: Colors.dark.crust, borderColor: Colors.dark.blue, borderWidth: 1, padding: 8, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'white', borderRadius: 14, fontFamily: "Inter" }}>

				</TextInput> */}
                <TView m='md' borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={question}
                        onChangeText={n => setQuestion(n)}
                        placeholder='My amazing question'
                        icon='help-sharp'
                        label='Question'
                        //error='Invalid deck name'
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <TView m='md' mt={2} borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={answer}
                        onChangeText={n => setAnswer(n)}
                        placeholder='My amazing answer'
                        icon='bulb-outline'
                        label='Answer'
                        //error='Invalid deck name'
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <FancyButton onPress={() => updateQuestionAnswerCard(deckId as any, cardIndexInt, updateCard, question, answer, card)} backgroundColor='blue' mt={'md'} mb={'sm'} icon='logo-firebase' mx={300} >
                    Done!
                </FancyButton>

            </TScrollView >
        </>
    );
};

export default EditCardScreen;

function updateQuestionAnswerCard(deckId: string, cardIndex: number, onPress: (deckId: any, newCard: Memento.Card, cardIndex: number) => void, newQuestion: string, newAnswer: string, card?: Memento.Card) {
    if (card) {
        card.answer = newAnswer;
        card.question = newQuestion;
        onPress(deckId, card, cardIndex);
    }
}