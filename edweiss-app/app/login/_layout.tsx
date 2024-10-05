import { ApplicationLayout } from '@/constants/Component';

import { useUser } from '@/contexts/user';
import { Redirect, Stack } from 'expo-router';
import React from 'react';

const LoginLayout: ApplicationLayout = () => {
	const { user } = useUser();

	if (user != undefined)
		return <Redirect href="/" />;

	return <Stack />;
};

export default LoginLayout;