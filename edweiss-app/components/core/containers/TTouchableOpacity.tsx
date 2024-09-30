import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import { ContainerProps, computeContainerStyle } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';

export type TTouchableOpacityProps = TouchableOpacityProps & ContainerProps;

export function TTouchableOpacity({ style, ...props }: TTouchableOpacityProps) {
	const computedBackgroundColor = useOptionalThemeColor({ light: props.light, dark: props.dark }, props.backgroundColor);
	const computedBorderColor = useOptionalColor(props.borderColor);

	return <TouchableOpacity
		activeOpacity={0.8}
		style={
			[
				computeContainerStyle(props, computedBackgroundColor, computedBorderColor),
				style,
			]
		}
		{...props}
	/>;
}
