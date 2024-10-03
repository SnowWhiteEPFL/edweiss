import { useUser } from '@/contexts/user';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

const _layout = () => {
	// const { userLoggedIn } = useAuth();
	const { user } = useUser();

	if (user != undefined)
		return <Redirect href="/" />;

	return <Stack />
}

export default _layout