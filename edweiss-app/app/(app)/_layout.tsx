import { Stack } from 'expo-router';
import React from 'react';

// function useAuth() {
// 	return { authentified: true };
// }

const _layout = () => {
	// const { authentified } = useAuth();

	// if (!authentified)
	// 	return <Redirect href={'/login' as Href} />

	return (
		<Stack>
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
		</Stack>
	)
}

export default _layout