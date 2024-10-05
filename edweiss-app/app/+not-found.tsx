import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import { Link } from 'expo-router';
import React from 'react';

const NotFound: ApplicationRoute = () => {
	return (
		<>
			<RouteHeader title='Nope.' />

			<TView flex={1} alignItems='center' justifyContent='center' p={20}>
				<TText bold size={'xl'}>You typed the route wrong.</TText>

				<Link href="/">
					<TText mt={15} pt={15} pb={15} color='blue' size={'md'}>Go to home screen!</TText>
				</Link>
			</TView>
		</>
	);
};

export default NotFound;
