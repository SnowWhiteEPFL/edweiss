import { ApplicationLayout } from '@/constants/Component';

import toastConfig from '@/config/toast-config';
import Colors from '@/constants/Colors';
import { AuthSessionProvider } from '@/contexts/auth';
import { UserProvider } from '@/contexts/user';
import useTheme from '@/hooks/theme/useTheme';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SystemUI from 'expo-system-ui';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';

const RootLayout: ApplicationLayout = () => {
	const theme = useTheme();

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
