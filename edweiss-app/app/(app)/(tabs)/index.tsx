
import For from '@/components/core/For';
import { TText } from '@/components/core/TText';
import { TTouchableOpacity } from '@/components/core/TTouchableOpacity';
import { TView } from '@/components/core/TView';
import FancyButton from '@/components/input/FancyButton';
import { Collections, callFunction } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Functions from '@/model/functions';
import { Card, CardQuestion, Deck } from '@/model/memento';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TextInput } from 'react-native';

export default function HomeScreen() {
	const [name, setName] = useState("");

	const decks = useDynamicDocs(Collections.deck);

	async function call() {
		if (name.length == 0)
			return;

		const res = await callFunction(Functions.createDeck, {
			deck: {
				name,
				cards: [
					{
						question: { type: "text", text: "What's the radius of the earth ?" },
						answer: "6391km"
					}
				]
			}
		});

		if (res.status == 1) {
			console.log(`OKAY, deck created with id ${res.data.id}`);
		}
	}

	return (
		<>
			<TView>
				<TextInput value={name} onChangeText={n => setName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ borderWidth: 1, borderColor: '#777', padding: 8, color: 'white', borderRadius: 6 }}>

				</TextInput>

				<FancyButton disabled={name.length == 0} outlined={name.length == 0} m={'xs'} onPress={call} icon='logo-firebase'>
					Create Deck
				</FancyButton>

				{/* {
					decks ?
						decks.map(deck => <DeckDisplay key={deck.id} deck={deck.data} id={deck.id} />) :
						<TActivityIndicator size={40} />
				} */}

				<For each={decks}>
					{deck => <DeckDisplay key={deck.id} deck={deck.data} id={deck.id} />}
				</For>

			</TView>
		</>
	);
}

function DeckDisplay({ deck, id }: { deck: Deck, id: string }) {
	return (
		<TTouchableOpacity onPress={() => router.push(`/deck/${id}`)} m='md' p='lg' borderColor='borderColor' b={1} radius='lg'>
			<TText mb='md'>
				{deck.name}
			</TText>
			{
				deck.cards.map(card => <CardDisplay key={card.answer} card={card} />)
			}
		</TTouchableOpacity>
	)
}

function CardDisplay({ card }: { card: Card }) {
	return (
		<TView>
			<QuestionDisplay question={card.question} />
			<TText>
				{card.answer}
			</TText>
		</TView>
	)
}

function QuestionDisplay({ question }: { question: CardQuestion }) {
	if (question.type == 'text') {
		return (
			<TText>
				{question.text}
			</TText>
		)
	}
}
