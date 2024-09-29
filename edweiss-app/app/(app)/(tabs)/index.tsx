
import For from '@/components/core/For';
import { TScrollView } from '@/components/core/TScrollView';
import { TText } from '@/components/core/TText';
import { TTouchableOpacity } from '@/components/core/TTouchableOpacity';
import { TView } from '@/components/core/TView';
import FancyButton from '@/components/input/FancyButton';
import { Collections, callFunction } from '@/config/firebase';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Functions from '@/model/functions';
import { Card, CardQuestion, Deck } from '@/model/memento';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';

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
			<Stack.Screen
				options={{
					title: "Home",
					headerTitleAlign: "center"
				}}
			/>
			<TScrollView>

				{/* <TextInput value={name} onChangeText={n => setName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ borderWidth: 1, borderColor: '#777', padding: 8, color: 'white', borderRadius: 6 }}>

				</TextInput> */}

				{/* <FancyButton disabled={name.length == 0} m={'xs'} onPress={call} icon='logo-firebase'>
					Create Deck
				</FancyButton> */}

				<FancyButton backgroundColor='base' mt={'md'} mb={'sm'} ml={'md'} mr={'md'} textColor='blue' onPress={call} icon='logo-firebase'>
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
			</TScrollView>
		</>
	);
}

function DeckDisplay({ deck, id }: { deck: Deck, id: string }) {
	return (
		<TTouchableOpacity bb={0} onPress={() => router.push(`/deck/${id}`)} m='md' mt={'sm'} mb={'sm'} p='lg' backgroundColor='base' borderColor='crust' radius='lg'>
			<TText>
				{deck.name}
			</TText>
			<TText mb='md' color='subtext0' size={'sm'}>
				2h ago
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
			<TText ml={'sm'} color='mauve'>
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
