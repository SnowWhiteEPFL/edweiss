
import For from '@/components/core/For';
import TText from '@/components/core/TText';
import TScrollView from '@/components/core/containers/TScrollView';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { Collections, callFunction } from '@/config/firebase';
import t from '@/config/i18config';
import Colors from '@/constants/Colors';
import ReactComponent, { ApplicationRoute } from '@/constants/Component';
import { useDynamicDocs } from '@/hooks/firebase/firestore';
import Memento from '@/model/memento';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { TextInput } from 'react-native';

const HomeTab: ApplicationRoute = () => {
	const [deckName, setDeckName] = useState("");

	const decks = useDynamicDocs(Collections.deck);

	async function call() {
		if (deckName.length == 0)
			return;

		const res = await callFunction(Memento.Functions.creation.createDeck, {
			deck: {
				name: deckName,
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
			<RouteHeader title={"Home"} />

			<TScrollView>
				<TextInput value={deckName} onChangeText={n => setDeckName(n)} placeholder='Deck name' placeholderTextColor={'#555'} style={{ borderWidth: 1, borderColor: Colors.dark.overlay0, padding: 8, paddingHorizontal: 16, margin: 16, marginBottom: 0, color: 'white', borderRadius: 14, fontFamily: "Inter" }}>

				</TextInput>

				<FancyButton backgroundColor='blue' mt={'md'} mb={'sm'} ml={'md'} mr={'md'} textColor='crust' onPress={call} icon='logo-firebase'>
					{t("memento:create-deck")}
				</FancyButton>

				<For each={decks}>
					{deck => <DeckDisplay key={deck.id} deck={deck.data} id={deck.id} />}
				</For>
			</TScrollView>
		</>
	);
};

export default HomeTab;

const DeckDisplay: ReactComponent<{ deck: Memento.Deck, id: string; }> = ({ deck, id }) => {
	return (
		<TTouchableOpacity bb={0} onPress={() => router.push(`/deck/${id}`)} m='md' mt={'sm'} mb={'sm'} p='lg' backgroundColor='base' borderColor='crust' radius='lg'>
			<TText bold>
				{deck.name}
			</TText>
			<TText mb='md' color='subtext0' size={'sm'}>
				2h ago
			</TText>
			{
				deck.cards.map(card => <CardDisplay key={card.answer} card={card} />)
			}
		</TTouchableOpacity>
	);
};

const CardDisplay: ReactComponent<{ card: Memento.Card; }> = ({ card }) => {
	return (
		<TView>
			<QuestionDisplay question={card.question} />
			<TText ml={'sm'} color='mauve'>
				{card.answer}
			</TText>
		</TView>
	);
};

const QuestionDisplay: ReactComponent<{ question: Memento.CardQuestion; }> = ({ question }) => {
	if (question.type == 'text') {
		return (
			<TText>
				{question.text}
			</TText>
		);
	}
};
