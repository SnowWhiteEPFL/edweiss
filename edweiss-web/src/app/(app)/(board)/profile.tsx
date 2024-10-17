import { signOut } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { Button } from '@nextui-org/react';

const ProfileRoute: ApplicationRoute = () => {
	const { user } = useAuth();

	return (
		<div>
			Connected as {user.name} ({user.type})

			<div>
				<Button onClick={signOut} color='danger' variant='light'>
					Disconnect
				</Button>
			</div>
		</div>
	);
};

export default ProfileRoute;


