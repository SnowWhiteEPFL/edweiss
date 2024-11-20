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
import { callFunction } from '@/config/firebase';
import { useRepositoryDocument } from '@/hooks/repository';
import { useStringParameters } from '@/hooks/routeParameters';
import Memento from '@/model/memento';
import { Redirect, router } from 'expo-router';
import React, { useState } from 'react';
import { DecksRepository } from '../../../_layout';

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
	const { deckId, prev_question, prev_answer, cardIndex } = useStringParameters();
	const [question, setQuestion] = useState(prev_question as string);
	const [answer, setAnswer] = useState(prev_answer as string);

	// const decks = useDynamicDocs(Collections.deck);
	// const deck = decks?.find(d => d.id == deckId);
	const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);
	if (deck == undefined)
		return <Redirect href={'/'} />;

	const cardIndexInt = cardIndex ? parseInt(cardIndex.toString()) : 0;

	const card = deck.data.cards[cardIndexInt];

	// Update a card with a new question and answer
	async function updateCard() {
		if (deck == undefined)
			return;

		const newCards = deck.data.cards;
		newCards[cardIndexInt] = card;

		handler.modifyDocument(deckId, {
			cards: newCards
		}, (deckId) => {
			callFunction(Memento.Functions.updateCard, { deckId, newCard: card, cardIndex: cardIndexInt });
		});


		// console.log(`OKAY, card updated with index ${cardIndexInt}`);
		// if (res.status == 1) {
		// }

		router.back();

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

				<FancyButton testID='updateCardButton' onPress={() => updateQuestionAnswerCard(deckId as any, cardIndexInt, updateCard, question, answer, card)} backgroundColor='blue' mt={'md'} mb={'sm'} icon='logo-firebase' mx={300} >
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