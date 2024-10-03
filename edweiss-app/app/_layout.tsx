import Colors from '@/constants/Colors';
import useTheme from '@/hooks/theme/useTheme';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { AuthSessionProvider } from '@/contexts/auth';
import { UserProvider } from '@/contexts/user';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import * as SystemUI from 'expo-system-ui';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// const Light: Theme = {
// 	dark: false,
// 	colors: {
// 		background: Colors.light.mantle,
// 		border: Colors.light.base,
// 		card: Colors.light.base,
// 		notification: Colors.light.blue,
// 		primary: Colors.light.blue,
// 		text: Colors.light.text
// 	}
// };

// const Dark: Theme = {
// 	dark: true,
// 	colors: {
// 		background: Colors.dark.mantle,
// 		border: Colors.dark.base,
// 		card: Colors.dark.base,
// 		notification: Colors.dark.blue,
// 		primary: Colors.dark.blue,
// 		text: Colors.dark.text,
// 	}
// };

export default function RootLayout() {
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
	}

	useEffect(() => {
		(async () => {
			await SystemUI.setBackgroundColorAsync(Colors[theme].mantle);
		})();
	}, [theme]);

	return (
		<AuthSessionProvider>
			<UserProvider>
				<ThemeProvider value={ThemeObj}>
					<GestureHandlerRootView style={{ flex: 1 }}>
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
	);
}
