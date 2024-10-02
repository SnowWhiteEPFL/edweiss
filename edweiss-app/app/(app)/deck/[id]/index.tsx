import Header from '@/components/core/Header';
import { TActivityIndicator } from '@/components/core/TActivityIndicator';
import { TText } from '@/components/core/TText';
import { TView } from '@/components/core/containers/TView';
import { Collections } from '@/config/firebase';
import { useDoc } from '@/hooks/firebase/firestore';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

const index = () => {
	const { id } = useLocalSearchParams();

	if (typeof id != 'string')
		return <Redirect href={'/'} />;

	const deck = useDoc(Collections.deck, id);

	if (deck == undefined)
		return <TActivityIndicator size={40} />

	return (
		<>
			<Header title={deck.data.name} />
			<TView>
				<TText>
					Deck name:
				</TText>
			</TView>
		</>
	)
}

export default index