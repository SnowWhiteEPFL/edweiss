import { ApplicationLayout } from '@/constants/Component';

import { useAuth } from '@/contexts/auth';
import { CoursesProvider } from '@/contexts/courses';
import { useUser } from '@/contexts/user';
import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { LoadingPageCompoment } from '../login';

const AppLayout: ApplicationLayout = () => {
	const { isUserLoggedIn: userLoggedIn, isLoading } = useAuth();
	const { user, loaded } = useUser();

	if (isLoading || !loaded) {
		return <LoadingPageCompoment />;
	}

	if (!userLoggedIn) {
		return <Redirect href="/login" />;
	}

	if (!user) {
		return <Redirect href="/login" />;
	}

	return (
		<CoursesProvider>
			<Stack screenOptions={{ headerShown: false }}>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</CoursesProvider>
	);
};

export default AppLayout;