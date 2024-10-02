import { Stack } from 'expo-router'
import React, { ReactNode } from 'react'

interface HeaderProps {
	title?: string,
	align?: "center" | "left",
	left?: (props: { canGoBack: boolean, tintColor?: string | undefined }) => ReactNode,
	right?: (props: { canGoBack: boolean, tintColor?: string | undefined }) => ReactNode,
	disabled?: boolean
}

const Header = ({ align = "center", ...props }: HeaderProps) => {
	return <Stack.Screen
		options={{
			title: props.title,
			headerTitleAlign: align,
			headerLeft: props.left,
			headerRight: props.right,
			headerShown: props.disabled != true,
			headerShadowVisible: false
		}}
	/>
}

export default Header