import { TView } from '@/components/core/TView';
import FancyButton from '@/components/input/FancyButton';
import { Stack, router } from 'expo-router';
import React from 'react';

const Friends = ["Monica", "Chandler", "Joey", "Rachel", "Phoebe", "Ross"];

const index = () => {
	return (
		<>
			<Stack.Screen
				options={{
					title: "Settings",
					headerTitleAlign: "center"
				}}
			/>

			<TView p={'md'}>
				{
					Friends.map(friend =>
						<FancyButton mb={'md'} key={friend} onPress={() => router.push(`/settings/friend/${friend}`)}>
							Go to friend {friend}
						</FancyButton>
					)
				}
			</TView>

		</>
	)
}

export default index