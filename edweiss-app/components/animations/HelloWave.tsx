import ReactComponent from '@/constants/Component';

import { StyleSheet } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withRepeat,
	withSequence,
	withTiming,
} from 'react-native-reanimated';
import TText from '../core/TText';

const HelloWave: ReactComponent<{}> = () => {
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
};

export default HelloWave;

const styles = StyleSheet.create({
	text: {
		fontSize: 28,
		lineHeight: 32,
		marginTop: -6,
	},
});
