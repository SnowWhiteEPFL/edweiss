
import TText from '@/components/core/TText'
import TView from '@/components/core/containers/TView'
import Header from '@/components/core/header/Header'
import FancyButton from '@/components/input/FancyButton'
import { signOut } from '@/config/firebase'
import { useUser } from '@/contexts/user'
import React from 'react'

const profile = () => {
	const { user } = useUser();

	return (
		<>
			<Header title='Profile' />

			<TView>
				<TText mb={'md'}>
					Connected as: {user.name}
				</TText>

				<FancyButton backgroundColor='red' icon='log-out' onPress={signOut}>
					Disconnect
				</FancyButton>
			</TView>
		</>
	)
}

export default profile

// import { TText } from '@/components/core/TText';
// import { TView } from '@/components/core/TView';
// import Colors from '@/constants/Colors';
// import useScroll from '@/hooks/animation/useScroll';
// import useTheme from '@/hooks/theme/useTheme';
// import { Stack } from 'expo-router';
// import React from 'react';
// import Animated, { Extrapolation, interpolate, useAnimatedStyle } from 'react-native-reanimated';

// function TopNavBar() {
// 	return (
// 		<TView>
// 			<TText>
// 				I'm navbar.
// 			</TText>
// 		</TView>
// 	)
// }

// const width = 0;

// const profile = () => {
// 	const [scrollY, scrollHandler] = useScroll();
// 	const theme = useTheme();

// 	const headerStyles = useAnimatedStyle(() => {
// 		return {
// 			backgroundColor: Colors[theme].base,
// 			// height: interpolate(scrollY.value, [0, 200], [60, 30], Extrapolation.CLAMP),
// 			marginBottom: interpolate(scrollY.value, [0, 200], [40, 10], Extrapolation.CLAMP),

// 			paddingTop: interpolate(scrollY.value, [0, 100, 200], [20, 10, 5], Extrapolation.CLAMP),
// 			paddingBottom: interpolate(scrollY.value, [0, 100, 200], [20, 10, 5], Extrapolation.CLAMP),
// 		};
// 	});

// 	const textStyles = useAnimatedStyle(() => {
// 		return {
// 			fontSize: interpolate(scrollY.value, [0, 200], [34, 16], Extrapolation.CLAMP),
// 			alignSelf: 'flex-start'
// 		};
// 	});

// 	return (
// 		<>
// 			<Stack.Screen options={{ headerShown: false }} />
// 			<TView pt={'xl'}>
// 				<TView mt={'xl'} mb={'xl'} backgroundColor='red'>
// 					<TText>
// 						HELLO
// 					</TText>
// 				</TView>

// 				<Animated.View style={headerStyles}>
// 					<Animated.Text style={textStyles}>Holo</Animated.Text>
// 				</Animated.View>

// 				<Animated.ScrollView scrollEventThrottle={1} onScroll={scrollHandler}>
// 					<TText mt={'xl'} mb={'xl'}> 1 </TText>
// 					<TText mt={'xl'} mb={'xl'}> 2 </TText>
// 					<TText mt={'xl'} mb={'xl'}> 3 </TText>
// 					<TText mt={'xl'} mb={'xl'}> 1 </TText>
// 					<TText mt={'xl'} mb={'xl'}> 2 </TText>
// 					<TText mt={'xl'} mb={'xl'}> 3 </TText>
// 				</Animated.ScrollView>
// 			</TView>
// 		</>
// 	)
// }

// export default profile