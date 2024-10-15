
import TText from '@/components/core/TText';
import RouteHeader from '@/components/core/header/RouteHeader';
import { ApplicationRoute } from '@/constants/Component';
import React from 'react';

const HomeTab: ApplicationRoute = () => {

	return (
		<>
			<RouteHeader title={"Home"} />

			<TText>
				Welcome to the Home tab!
			</TText>
		</>
	);
};

export default HomeTab;
