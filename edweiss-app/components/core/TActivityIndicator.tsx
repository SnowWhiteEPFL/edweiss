import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

import { Color, LightDarkProps } from '@/constants/Colors';
import { BoxModelProps, Size, computeBoxModelSize } from '@/constants/Sizes';
import useThemeColor from '@/hooks/theme/useThemeColor';

export type TActivityIndicatorProps = ActivityIndicatorProps & LightDarkProps & BoxModelProps & {
	color?: Color,
	size?: Size,
}

export function TActivityIndicator({ style, light, dark, color = 'text', ...rest }: TActivityIndicatorProps) {
	const computedColor = useThemeColor({ light, dark }, color);

	return (
		<ActivityIndicator
			color={computedColor}
			style={[
				computeBoxModelSize(rest),
				style
			]}
			{...rest}
		/>
	);
}
