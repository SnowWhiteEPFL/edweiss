import { ApplicationLayout } from '@/constants/Component';

import TabBarIcon from '@/components/navigation/TabBarIcon';
import Colors from '@/constants/Colors';
import useTheme from '@/hooks/theme/useTheme';
import { Tabs } from 'expo-router';
import React from 'react';

const TabLayout: ApplicationLayout = () => {
	const theme = useTheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[theme].blue,
				headerShown: true,
				tabBarLabelStyle: {
					fontFamily: "Inter"
				}
			}}>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="community"
				options={{
					title: 'Community',
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? 'planet' : 'planet-outline'} color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					title: 'Profile',
					tabBarIcon: ({ color, focused }) => (
						<TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} />
					),
				}}
			/>
		</Tabs>
	);
};

export default TabLayout;
