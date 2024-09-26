import { StyleSheet } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import { TText } from '../core/TText';

export function HelloWave() {
	const rotationAnimation = useSharedValue(0);

	rotationAnimation.value = withRepeat(
		withSequence(withTiming(25, { duration: 150 }), withTiming(0, { duration: 150 })),
		4
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotationAnimation.value}deg` }],
	}));

	return (
		<Animated.View style={animatedStyle}>
			<TText style={styles.text}>👋</TText>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	text: {
		fontSize: 28,
		lineHeight: 32,
		marginTop: -6,
	},
});
