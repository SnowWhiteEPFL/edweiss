
import { TText } from '@/components/core/TText';
import { TView } from '@/components/core/TView';
import { StyleSheet } from 'react-native';

export default function TabTwoScreen() {
	return (
		<TView>
			<TView style={styles.titleContainer}>
				<TText bold size={'xl'}>Explore</TText>
			</TView>
			<TText>This app includes example code to help you get started.</TText>
		</TView>
	);
}

const styles = StyleSheet.create({
	headerImage: {
		color: '#808080',
		bottom: -90,
		left: -35,
		position: 'absolute',
	},
	titleContainer: {
		flexDirection: 'row',
		gap: 8,
	},
});
