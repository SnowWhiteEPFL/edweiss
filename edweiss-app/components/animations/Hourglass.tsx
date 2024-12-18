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

const Hourglass: ReactComponent<{}> = () => {
	const rotationAnimation = useSharedValue(0);

	rotationAnimation.value = withRepeat(
		withSequence(withTiming(360, { duration: 1200 }), withTiming(0, { duration: 1200 }), withTiming(0, { duration: 1200 })),
		40
	);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ rotate: `${rotationAnimation.value}deg` }],
	}));

	return (
		<Animated.View style={animatedStyle}>
			{/* <Icon name='hourglass-outline' size={40} color='blue' /> */}
			<TText style={styles.text}>⏳</TText>
		</Animated.View>
	);
};

export default Hourglass;

const styles = StyleSheet.create({
	text: {
		fontSize: 36,
		lineHeight: 36,
		marginTop: -4,
	},
});
