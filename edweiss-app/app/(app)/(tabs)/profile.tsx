import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { signOut } from '@/config/firebase';
import { useUser } from '@/contexts/user';
import React from 'react';

const ProfileTab: ApplicationRoute = () => {
	const { user } = useUser();

	return (
		<>
			<RouteHeader title='Profile' />

			<TView>
				<TText mb={'md'}>
					Connected as: {user.name}
				</TText>

				<FancyButton backgroundColor='red' icon='log-out' onPress={signOut}>
					Disconnect
				</FancyButton>
			</TView>
		</>
	);
};

export default ProfileTab;
