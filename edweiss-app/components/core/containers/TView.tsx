import { View, type ViewProps } from 'react-native';

import { ContainerProps, computeContainerStyle } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';

export type TViewProps = ViewProps & ContainerProps;

export default function TView({ backgroundColor, style, ...props }: TViewProps) {
	const computedBackgroundColor = useOptionalThemeColor({ light: props.light, dark: props.dark }, backgroundColor);
	const computedBorderColor = useOptionalColor(props.borderColor);

	return <View
		style={
			[
				computeContainerStyle(props, computedBackgroundColor, computedBorderColor),
				style
			]
		}
		{...props}
	/>
}
