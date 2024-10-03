import { ScrollView, type ScrollViewProps } from 'react-native';

import { ContainerProps, computeContainerStyle } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';

export type TScrollViewProps = ScrollViewProps & ContainerProps;

export default function TScrollView({ style, ...props }: TScrollViewProps) {
	const computedBackgroundColor = useOptionalThemeColor({ light: props.light, dark: props.dark }, props.backgroundColor);
	const computedBorderColor = useOptionalColor(props.borderColor);

	return <ScrollView
		style={
			[
				computeContainerStyle(props, computedBackgroundColor, computedBorderColor),
				style
			]
		}
		{...props}
	/>;
}

// export function TScrollView({ style, light, dark, backgroundColor, flex, flexDirection, alignItems, justifyContent, radius, borderColor, ...rest }: TScrollViewProps) {
// 	const computedBackgroundColor = useOptionalThemeColor({ light, dark }, backgroundColor);
// 	const computedBorderColor = useOptionalColor(borderColor);

// 	return <ScrollView
// 		style={
// 			[
// 				// {
// 				// 	backgroundColor: computedBackgroundColor,
// 				// 	display: flex ? 'flex' : undefined,
// 				// 	flexDirection,
// 				// 	borderRadius: computeSizeOpt(radius, radiusSizes),
// 				// 	borderColor: computedBorderColor,
// 				// 	justifyContent,
// 				// 	alignItems,
// 				// 	rowGap: computeSizeOpt(rest.rowGap, gapSizes),
// 				// 	columnGap: computeSizeOpt(rest.columnGap, gapSizes),
// 				// },
// 				computeContainerStyle(rest),
// 				computeBoxModelSize(rest),
// 				style
// 			]
// 		}
// 		{...rest}
// 	/>;
// }
