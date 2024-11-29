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
import { router } from 'expo-router';
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
	const [question, setQuestion] = useState(prev_question);
	const [answer, setAnswer] = useState(prev_answer);
	const [existedQuestion, setExistedQuestion] = useState(false);
	const [emptyField, setEmptyField] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);

	const cardIndexInt = cardIndex ? parseInt(cardIndex.toString()) : 0;

	const card = deck?.data.cards[cardIndexInt];

	// Update a card with a new question and answer
	async function updateCard(new_Question: string, new_Answer: string) {
		if (deck == undefined || card == undefined)
			return;

		const isDuplicate = deck.data.cards.some(card => card.question === new_Question) && new_Question != prev_question;
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

		const newCards = deck.data.cards;
		newCards[cardIndexInt] = { ...card, question: new_Question, answer: new_Answer };

		handler.modifyDocument(deckId, {
			cards: newCards
		}, (deckId) => {
			callFunction(Memento.Functions.updateCard, { deckId, newCard: { ...card, question: new_Question, answer: new_Answer }, cardIndex: cardIndexInt });
		});

		router.back();

	}

	return (
		<>
			<RouteHeader title='Edit card' />

			<TScrollView>

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
					//onPress={() => updateQuestionAnswerCard(deckId as any, cardIndexInt, updateCard, question, answer, card)}
					onPress={() => {
						setIsLoading(true)
						updateCard(question, answer)
					}}
					backgroundColor='blue' mt={'md'} mb={'sm'} icon='logo-firebase' mx={300}
				>
					Done!
				</FancyButton>

			</TScrollView >
		</>
	);
};

export default EditCardScreen;
