import { ApplicationRoute } from '@/constants/Component';

import Avatar from '@/components/Avatar';
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
			<RouteHeader title='My Profile' />

			<TView>
				<TView m={'md'} flexDirection='row' alignItems='center' flexColumnGap={'lg'}>
					<Avatar name={user.name} size={64} />
					<TView>
						<TText size={'lg'}>
							{user.name}
						</TText>
						<TText color='subtext0' size={'sm'}>
							IN BA5
						</TText>
					</TView>
				</TView>

				<FancyButton backgroundColor='transparent' textColor='red' icon='log-out' onPress={signOut}>
					Disconnect
				</FancyButton>
			</TView>
		</>
	);
};

export default ProfileTab;
