import { ApplicationRoute } from '@/constants/Component';

import Avatar from '@/components/Avatar';
import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { signOut } from '@/config/firebase';
import { useUser } from '@/contexts/user';
import { switchPermissionsAction } from '@/utils/auth/authActionsFunctions';
import React from 'react';

const ProfileTab: ApplicationRoute = () => {
	const { user } = useUser();

	const [loading, setLoading] = React.useState(false);

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

				<FancyButton loading={loading} backgroundColor={user.type === "student" ? 'maroon' : 'yellow'} textColor='crust' icon='build' onPress={async () => { setLoading(true); await switchPermissionsAction(); setLoading(false) }}>
					Switch to {`${user.type === 'student' ? 'teacher' : 'student'}`} account
				</FancyButton>

				<FancyButton backgroundColor='transparent' textColor='red' icon='log-out' onPress={signOut}>
					Disconnect
				</FancyButton>
			</TView>
		</>
	);
};

export default ProfileTab;
