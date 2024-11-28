/**
 * Create a card screen
 * User can create a card with a question and an answer
 * 
 * @file index.tsx
 * @description Screen to create a card with a question and an answer
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
// ----------------- CreateCardScreen Component ----------------
// ------------------------------------------------------------

/**
 * Create a card screen
 * User can create a card with a question and an answer
 * 
 * @returns {ApplicationRoute} Screen to create a card
 */
const CreateCardScreen: ApplicationRoute = () => {
	const { deckId } = useStringParameters();
	const [question, setQuestion] = useState("");
	const [answer, setAnswer] = useState("");
	const [existedQuestion, setExistedQuestion] = useState(false);

	// const deck = useDoc(Collections.deck, deckId);

	const [deck, handler] = useRepositoryDocument(deckId, DecksRepository);

	// if (!deck)
	// 	return <Redirect href={'/'} />;

	// Create a new card
	async function createCard() {

		if (question.length == 0 || answer.length == 0 || existedQuestion)
			return;

		const isDuplicate = deck?.data.cards.some(card => card.question === question);
		if (isDuplicate) {
			setExistedQuestion(true);
			return;  // Prevent creation if a duplicate is found
		}

		const card: Memento.Card = {
			question: question,
			answer: answer,
			learning_status: "Not yet",
		};

		const previousCards = deck?.data.cards ?? [];

		handler.modifyDocument(deckId, { cards: [...previousCards, card] }, () => {
			callFunction(Memento.Functions.createCard, {
				deckId: deckId,
				card
			});
		});

		// if (res.status == 1) {
		// 	console.log(`OKAY, card created with id ${res.data.id}`);
		// }

		router.back();
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

				<FancyButton testID='createCardButton' backgroundColor='blue' mt={'md'} mb={'sm'} icon='logo-firebase' onPress={createCard}>
					Create Card
				</FancyButton>

			</TScrollView >
		</>
	);
};

export default CreateCardScreen;
