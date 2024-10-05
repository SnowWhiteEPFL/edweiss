import ReactComponent from '@/constants/Component';

import { Stack } from 'expo-router';
import React, { ReactNode } from 'react';

interface HeaderProps {
	title?: string,
	align?: "center" | "left",
	left?: ReactNode,
	right?: ReactNode,
	disabled?: boolean;
}

const RouteHeader: ReactComponent<HeaderProps> = (props = { align: "center" }) => {
	return <Stack.Screen
		options={{
			title: props.title,
			headerTitleStyle: {
				fontFamily: "Inter"
			},
			headerTitleAlign: props.align,
			headerLeft: _ => props.left,
			headerRight: _ => props.right,
			headerShown: props.disabled != true,
			headerShadowVisible: false
		}}
	/>;
};

export default RouteHeader;