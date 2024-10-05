import { ApplicationRoute } from '@/constants/Component';

import TActivityIndicator from '@/components/core/TActivityIndicator';
import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { Collections } from '@/config/firebase';
import { useDoc } from '@/hooks/firebase/firestore';
import { Redirect, useLocalSearchParams } from 'expo-router';
import React from 'react';

const Deck: ApplicationRoute = () => {
	const { id } = useLocalSearchParams();

	if (typeof id != 'string')
		return <Redirect href={'/'} />;

	const deck = useDoc(Collections.deck, id);

	if (deck == undefined)
		return <TActivityIndicator size={40} />;

	return (
		<>
			<RouteHeader title={deck.data.name} />

			<TView>
				<TText>
					Deck name:
				</TText>
			</TView>
		</>
	);
};

export default Deck;
