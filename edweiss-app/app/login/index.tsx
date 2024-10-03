import TText from '@/components/core/TText'
import TView from '@/components/core/containers/TView'
import Header from '@/components/core/header/Header'
import FancyButton from '@/components/input/FancyButton'
import { callFunction, signInWithGoogle } from '@/config/firebase'
import { useAuth } from '@/contexts/auth'
import Functions from '@/model/functions'
import { router } from 'expo-router'
import React, { useState } from 'react'

const index = () => {
	const auth = useAuth();

	const [loading, setLoading] = useState(false);

	async function signIn() {
		setLoading(true);

		const res = await signInWithGoogle();

		if (res != undefined) {
			const accountRes = await callFunction(Functions.createAccount, { name: res.user.displayName });

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
			<Header title='Login' />

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
	)
}

export default index