import { ApplicationRoute } from '@/constants/Component';

import TText from '@/components/core/TText';
import TTouchableOpacity from '@/components/core/containers/TTouchableOpacity';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, signInAnonymously, signInWithGoogle } from '@/config/firebase';
import t from '@/config/i18config';
import { useAuth } from '@/contexts/auth';
import { Auth } from '@/model/users';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, useWindowDimensions } from 'react-native';

const Login: ApplicationRoute = () => {
	const auth = useAuth();

	const { width, height } = useWindowDimensions();
	const [loadingGoogle, setLoadingGoogle] = useState(false);
	const [loadingAnon, setLoadingAnon] = useState(false);
	const [quoteN, setQuoteN] = useState(1);

	async function signInGoogle() {
		setLoadingGoogle(true);

		const res = await signInWithGoogle();

		if (res != undefined) {
			const accountRes = await callFunction(Auth.Functions.createAccount, { name: res.user.displayName });

			if (accountRes.status == 1) {
				router.replace("/");
			} else {
				console.log(accountRes.error);
				setLoadingGoogle(false);
			}
		}
	}

	async function signInAnounymous() {
		setLoadingAnon(true);

		const res = await signInAnonymously();

		if (res != undefined) {
			const accountRes = await callFunction(Auth.Functions.createAccount, { name: res.user.displayName });

			if (accountRes.status == 1) {
				router.replace("/");
			} else {
				console.log(accountRes.error);
				setLoadingAnon(false);
			}
		}
	}


	function getColor(quoteNumber: number) {
		return quoteN === quoteNumber ? 'sky' : 'surface0';
	}
	function generateQuotes() {
		return `login:quotes_${quoteN}`
	}

	return (
		<>

			<RouteHeader disabled title='Login' />

			<TView style={{ flex: 1, backgroundColor: 'white' }} pl={'lg'} pr={'lg'}>


				<TView flex={1} justifyContent='flex-start' alignItems='center'>
					<Image
						source={require('../../assets/images/mountain_logo.png')}
						style={{ width: width * 0.8, height: height * 0.45, resizeMode: 'contain' }}
					/>
					<TText mb={25} bold size={50}>{t(`login:Welcome_title`)}</TText>
					<TText align='center' size={18} color='darkNight'>{t(generateQuotes() as any)}</TText>

					<TView flexDirection='row' justifyContent='space-between' style={{ width: '75%' }} mr={20} ml={20} mt={30}>
						<TTouchableOpacity borderColor='subtext0' b={1} backgroundColor={getColor(1)} radius={'md'} onPress={() => setQuoteN(1)} testID='quote-but-1'>
							<TText>            </TText>
						</TTouchableOpacity>
						<TTouchableOpacity borderColor='subtext0' b={1} backgroundColor={getColor(2)} radius={'md'} onPress={() => setQuoteN(2)} testID='quote-but-2'>
							<TText>            </TText>
						</TTouchableOpacity>
						<TTouchableOpacity borderColor='subtext0' b={1} backgroundColor={getColor(3)} radius={'md'} onPress={() => setQuoteN(3)} testID='quote-but-3'>
							<TText>            </TText>
						</TTouchableOpacity>
					</TView>
				</TView>

				<FancyButton onPress={signInGoogle} loading={loadingGoogle} icon='logo-google' mb={'md'} testID='google-but'>
					{t(`login:continue_with_google`)}
				</FancyButton>

				<FancyButton onPress={signInAnounymous} loading={loadingAnon} icon='shield-half-outline' mb={'lg'} outlined testID='anon-but'>
					{t(`login:continue_annymous`)}
				</FancyButton>

			</TView>
		</>
	);
};

export default Login;