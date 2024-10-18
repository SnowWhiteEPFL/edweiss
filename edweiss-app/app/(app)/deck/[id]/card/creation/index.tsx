import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';

import TScrollView from '@/components/core/containers/TScrollView';
import TView from '@/components/core/containers/TView';
import FancyButton from '@/components/input/FancyButton';
import FancyTextInput from '@/components/input/FancyTextInput';
import { callFunction, Collections } from '@/config/firebase';
import { useDoc } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';

const CreateCardScreen: ApplicationRoute = () => {
    const { deckId } = useLocalSearchParams();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [existedQuestion, setExistedQuestion] = useState(false);

    const deck = useDoc(Collections.deck, deckId as string);

    async function createCard() {

        if (question.length == 0 || answer.length == 0 || existedQuestion)
            return;

        const isDuplicate = deck?.data.cards.some(card => card.question === question);
        if (isDuplicate) {
            setExistedQuestion(true);
            return;  // Prevent creation if a duplicate is found
        }

        const res = await callFunction(Memento.Functions.createCard, {
            deckId: deckId,
            card: {
                question: question,
                answer: answer,
                learning_status: "Not yet",
            }

        });

        if (res.status == 1) {
            console.log(`OKAY, card created with id ${res.data.id}`);
            router.back();
        }

    }

    return (
        <>
            <RouteHeader title='Create a card' />

            <TScrollView>
                {/* <TextInput value={deckName} onChangeText={n => setDeckName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ backgroundColor: Colors.dark.crust, borderColor: Colors.dark.blue, borderWidth: 1, padding: 8, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'white', borderRadius: 14, fontFamily: "Inter" }}>

				</TextInput> */}
                <TView m='md' borderColor='crust' radius='lg'>
                    <FancyTextInput
                        value={question}
                        onChangeText={n => {
                            setQuestion(n);
                            setExistedQuestion(false);
                        }}
                        placeholder='My amazing question'
                        icon='help-sharp'
                        label='Question'
                        error={existedQuestion ? 'Question already exists' : undefined}
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
                        multiline
                        numberOfLines={3}
                    />
                </TView>

                <FancyButton backgroundColor='blue' mt={'md'} mb={'sm'} icon='logo-firebase' mx={300} onPress={createCard}>
                    Create Card
                </FancyButton>

            </TScrollView >
        </>
    );
};

export default CreateCardScreen;
