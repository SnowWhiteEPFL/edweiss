import { googleSignIn } from '@/config/firebase';
import { ApplicationRoute } from '@/constants/Component';
import { Button } from '@nextui-org/react';

const LoginRoute: ApplicationRoute = () => {
	return (
		<>
			<Button color='primary' onClick={googleSignIn}>
				Login
			</Button>
		</>
	);
};

export default LoginRoute;