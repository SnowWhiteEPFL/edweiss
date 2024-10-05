import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, signInWithGoogle } from '@/config/firebase';
import { useAuth } from '@/contexts/auth';
import { Auth } from '@/model/users';
import { router } from 'expo-router';
import React, { useState } from 'react';

const Login: ApplicationRoute = () => {
	const auth = useAuth();

	const [loading, setLoading] = useState(false);

	async function signIn() {
		setLoading(true);

		const res = await signInWithGoogle();

		if (res != undefined) {
			const accountRes = await callFunction(Auth.Functions.createAccount, { name: res.user.displayName });

			if (accountRes.status == 1) {
				router.replace("/");
			} else {
				console.log(accountRes.error);
				setLoading(false);
			}
		}
	}

	return (
		<>
			<RouteHeader title='Login' />

			<TView pl={'lg'} pr={'lg'}>
				<TText mb={'md'}>
					I need to login to access the (app) group !
				</TText>

				<FancyButton onPress={signIn} loading={loading} mb={'md'}>
					Continue with Google
				</FancyButton>

				<TText>
					{JSON.stringify(auth)}
				</TText>
			</TView>
		</>
	);
};

export default Login;