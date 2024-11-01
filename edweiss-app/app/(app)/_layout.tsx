import { ApplicationLayout } from '@/constants/Component';

import TText from '@/components/core/TText';
import TView from '@/components/core/containers/TView';
import { useAuth } from '@/contexts/auth';
import { CoursesProvider } from '@/contexts/courses';
import { useUser } from '@/contexts/user';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

const AppLayout: ApplicationLayout = () => {
	const { isUserLoggedIn: userLoggedIn, isLoading } = useAuth();
	const { user, loaded } = useUser();

	if (isLoading || !loaded) {
		return <TView><TText>Loading authentification {JSON.stringify({ userLoggedIn, isLoading, user, loaded })}</TText></TView>;
	}

	if (!userLoggedIn) {
		return <Redirect href="/login" />;
	}

	if (!user) {
		return <Redirect href="/login" />;
	}

	return (
		<CoursesProvider>
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			</Stack>
		</CoursesProvider>
	);
};

export default AppLayout;