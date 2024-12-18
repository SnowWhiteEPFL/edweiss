import { ApplicationLayout } from '@/constants/Component';

import toastConfig from '@/config/toast-config';
import Colors from '@/constants/Colors';
import { AuthSessionProvider } from '@/contexts/auth';
import { UserProvider } from '@/contexts/user';
import useTheme from '@/hooks/theme/useTheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { SplashScreen, Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

SplashScreen.preventAutoHideAsync();

const RootLayout: ApplicationLayout = () => {
	const [loaded, error] = useFonts({
		'Inter-Thin': require("../assets/fonts/Inter-Thin.ttf"),
		'Inter-ExtraLight': require("../assets/fonts/Inter-ExtraLight.ttf"),
		'Inter-Light': require("../assets/fonts/Inter-Light.ttf"),
		'Inter-Regular': require("../assets/fonts/Inter-Regular.ttf"),
		'Inter-Medium': require("../assets/fonts/Inter-Medium.ttf"),
		'Inter-SemiBold': require("../assets/fonts/Inter-SemiBold.ttf"),
		'Inter-Bold': require("../assets/fonts/Inter-Bold.ttf"),
	});

	const theme = useTheme();

	useEffect(() => {
		if (loaded || error) {
			SplashScreen.hideAsync();
		}
	}, [loaded, error]);

	const ThemeObj: Theme = {
		dark: theme == 'dark',
		colors: {
			background: Colors[theme].mantle,
			border: Colors[theme].mantle,
			card: Colors[theme].mantle,
			notification: Colors[theme].blue,
			primary: Colors[theme].blue,
			text: Colors[theme].text,
		}
	};

	useEffect(() => {
		(async () => {
			await SystemUI.setBackgroundColorAsync(Colors[theme].mantle);
		})();
	}, [theme]);

	console.log("In LAYOUT 1");

	if (!loaded && !error) {
		return null;
	}

	console.log("In LAYOUT 2");

	return (
		<>
			<AuthSessionProvider>
				<UserProvider>
					<ThemeProvider value={ThemeObj}>
						<GestureHandlerRootView>
							<BottomSheetModalProvider>
								<Stack>
									<Stack.Screen name="(app)" options={{ headerShown: false }} />
									<Stack.Screen name="login" options={{ headerShown: false }} />
									<Stack.Screen name="+not-found" />
								</Stack>
							</BottomSheetModalProvider>
						</GestureHandlerRootView>
					</ThemeProvider>
				</UserProvider>
			</AuthSessionProvider>

			<Toast config={toastConfig} />
		</>
	);
};

export default RootLayout;
