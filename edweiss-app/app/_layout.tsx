import Colors from '@/constants/Colors';
import useTheme from '@/hooks/theme/useTheme';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useEffect } from 'react';

import { AuthContextProvider } from '@/contexts/AuthContext';
import * as SystemUI from 'expo-system-ui';

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
		<AuthContextProvider>
			<ThemeProvider value={ThemeObj}>
				<Stack>
					<Stack.Screen name="(app)" options={{ headerShown: false }} />
					<Stack.Screen name="+not-found" />
				</Stack>
			</ThemeProvider>
		</AuthContextProvider>
	);
}
