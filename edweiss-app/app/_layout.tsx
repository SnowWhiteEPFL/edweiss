import Colors from '@/constants/Colors';
import useTheme from '@/hooks/theme/useTheme';
import { Theme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';

const Light: Theme = {
	dark: false,
	colors: {
		background: Colors.light.background,
		border: Colors.light.background,
		card: Colors.light.background,
		notification: Colors.light.tint,
		primary: Colors.light.tint,
		text: Colors.light.text
	}
}

const Dark: Theme = {
	dark: true,
	colors: {
		background: Colors.dark.background,
		border: Colors.dark.background,
		card: Colors.dark.background,
		notification: Colors.dark.tint,
		primary: Colors.dark.tint,
		text: Colors.dark.text,
	}
}

export default function RootLayout() {
	const colorScheme = useTheme();

	return (
		<ThemeProvider value={colorScheme === 'light' ? Light : Dark}>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="+not-found" />
			</Stack>
		</ThemeProvider>
	);
}
