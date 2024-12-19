/**
 * @file index.tsx
 * @description The main login screen for the EdWeiss app, 
 * 				with it loading screen component.
 * @author Adamm Alaoui & Youssef Laraki
 */

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import RouteHeader from '@/components/core/header/RouteHeader';
import FancyButton from '@/components/input/FancyButton';
import { callFunction, signInAnonymously, signInWithGoogle } from '@/config/firebase';
import t from '@/config/i18config';
import { ApplicationRoute } from '@/constants/Component';
import { useAuth } from '@/contexts/auth';
import { Auth } from '@/model/users';
import { Link, router } from 'expo-router';
import React, { useState } from 'react';
import { useWindowDimensions } from 'react-native';

import EdweissLogo from '@/assets/images/edweiss2.svg';
import HelloWave from '@/components/animations/HelloWave';
import TSafeArea from '@/components/core/containers/TSafeArea';
import Colors from '@/constants/Colors';
import useTheme from '@/hooks/theme/useTheme';

const Login: ApplicationRoute = () => {
	const auth = useAuth();

	// Use states
	const { width, height } = useWindowDimensions();
	const [loadingGoogle, setLoadingGoogle] = useState(false);
	const [loadingAnon, setLoadingAnon] = useState(false);

	async function signIn(setLoading: React.Dispatch<React.SetStateAction<boolean>>, signInMethod: () => Promise<any>) {
		setLoading(true);

		const res = await signInMethod();

		if (res) {
			const accountRes = await callFunction(Auth.Functions.createAccount, { name: (res.user.displayName) ? res.user.displayName : "Anonymous" });

			if (accountRes.status == 1) {
				router.replace("/");
			} else {
				setLoadingGoogle(false);
				setLoadingAnon(false);
			}
		}
	}

	const theme = useTheme();

	return (
		<>
			<RouteHeader disabled title='Login' />

			<TSafeArea style={{ flex: 1, backgroundColor: Colors[theme].mantle }}>
				<TView flex={1} justifyContent='flex-start'>
					<TView my={144} alignItems='center'>
						<EdweissLogo color={Colors[theme].text} width={width * 0.6} />
						<TView flexDirection='row' mt={-8} style={{ width: width * 0.6 }}>
							<TView backgroundColor='red' flex={1} py={2} />
							<TView backgroundColor='yellow' flex={1} py={2} />
							<TView backgroundColor='green' flex={1} py={2} />
							<TView backgroundColor='blue' flex={1} py={2} />
						</TView>
					</TView>

					<TView px={"md"}>
						<TView flexDirection='row' alignItems='center' flexColumnGap={6} mb={"sm"}>
							{/* <TText size={"xl"} bold>{t(`login:welcome_title`)}</TText> */}

							<TText size={"xl"} bold>Hello,</TText>
							<TText size={"xl"} bold color='mauve' mr={4}>you</TText>
							<HelloWave />
						</TView>
						<TText align='justify' color='subtext0' lineHeight={24} testID='quote-text-output'>
							{t("login:quotes_1")}
						</TText>
					</TView>
				</TView>

				<FancyButton onPress={() => signIn(setLoadingGoogle, signInWithGoogle)} loading={loadingGoogle} disabled={loadingGoogle || loadingAnon} icon='logo-google' mb={'md'} testID='google-but'>
					{t(`login:continue_with_google`)}
				</FancyButton>

				<FancyButton onPress={() => signIn(setLoadingAnon, signInAnonymously)} loading={loadingAnon} disabled={loadingGoogle || loadingAnon} icon='eye-off-outline' outlined style={{ borderWidth: 0 }} backgroundColor='mauve' testID='anon-but'>
					{t(`login:continue_annymous`)}
				</FancyButton>

				<TView mt={20} mb={20}>
					<TText align='center' color='subtext1' size={"sm"}>
						{t('login:terms_of_use_agree1')} <Link style={{ textDecorationLine: 'underline' }} href={'/login/fake_terms_of_use'}>{t('login:terms_of_use_agree2')}</Link>.
					</TText>
				</TView>
			</TSafeArea>
		</>
	);
};

export default Login;