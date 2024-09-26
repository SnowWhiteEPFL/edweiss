import { View, type ViewProps } from 'react-native';

import { computeBoxModelSize, computeSizeOpt, gapSizes, radiusSizes } from '@/constants/Sizes';
import { ContainerProps } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';

export type TViewProps = ViewProps & ContainerProps;

export function TView({ style, light, dark, backgroundColor, flex, flexDirection, justifyContent, alignItems, radius, borderColor, ...rest }: TViewProps) {
	const computedBackgroundColor = useOptionalThemeColor({ light, dark }, backgroundColor);
	const computedBorderColor = useOptionalColor(borderColor);

	return <View
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
