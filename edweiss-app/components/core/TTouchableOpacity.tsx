import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { computeBoxModelSize, computeSizeOpt, gapSizes, radiusSizes } from '@/constants/Sizes';
import { ContainerProps } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';

export type TTouchableOpacityProps = TouchableOpacityProps & ContainerProps;

export function TTouchableOpacity({ style, light, dark, backgroundColor, flex, flexDirection, justifyContent, alignItems, radius, borderColor, ...rest }: TTouchableOpacityProps) {
	const computedBackgroundColor = useOptionalThemeColor({ light, dark }, backgroundColor);
	const computedBorderColor = useOptionalColor(borderColor);

	return <TouchableOpacity
		activeOpacity={0.8}
		style={
			[
				{
					backgroundColor: computedBackgroundColor,
					display: flex ? 'flex' : undefined,
					flexDirection,
					borderRadius: computeSizeOpt(radius, radiusSizes),
					borderColor: computedBorderColor,
					justifyContent,
					alignItems,
					rowGap: computeSizeOpt(rest.rowGap, gapSizes),
					columnGap: computeSizeOpt(rest.columnGap, gapSizes),
				},
				computeBoxModelSize(rest),
				style
			]
		}
		{...rest}
	/>;
}
