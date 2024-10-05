import { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'

export default function useScroll() {
	const scrollY = useSharedValue(0)

	const scrollHandler = useAnimatedScrollHandler((event) => {
		scrollY.value = event.contentOffset.y
	})

	return [scrollY, scrollHandler] as const
}
