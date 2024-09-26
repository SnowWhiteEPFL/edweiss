import { ScrollView, type ScrollViewProps } from 'react-native';

import { computeBoxModelSize, computeSizeOpt, gapSizes, radiusSizes } from '@/constants/Sizes';
import { ContainerProps } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';

export type TScrollViewProps = ScrollViewProps & ContainerProps;

export function TScrollView({ style, light, dark, backgroundColor, flex, flexDirection, alignItems, justifyContent, radius, borderColor, ...rest }: TScrollViewProps) {
	const computedBackgroundColor = useOptionalThemeColor({ light, dark }, backgroundColor);
	const computedBorderColor = useOptionalColor(borderColor);

	return <ScrollView
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
