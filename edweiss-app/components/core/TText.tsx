import { Text, type TextProps } from 'react-native';

import { Color, LightDarkProps } from '@/constants/Colors';
import { BoxModelProps, Size, computeBoxModelSize, computeSize, lineHeightSizes, textSizes } from '@/constants/Sizes';
import useThemeColor from '@/hooks/theme/useThemeColor';

export type TTextProps = TextProps & LightDarkProps & BoxModelProps & {
	color?: Color,
	size?: Size,
	bold?: boolean,
	lineHeight?: Size,
	align?: "auto" | "left" | "right" | "center" | "justify"
}

export function TText({ style, light, dark, size = 'md', bold = false, lineHeight = 'md', color = 'text', align, ...rest }: TTextProps) {
	const computedColor = useThemeColor({ light, dark }, color);

	return (
		<Text
			style={[
				{
					color: computedColor,
					fontSize: computeSize(size, textSizes),
					lineHeight: computeSize(size, lineHeightSizes),
					fontWeight: bold ? 600 : 'normal',
					textAlign: align,
					fontFamily: "Inter"
				},
				computeBoxModelSize(rest),
				style
			]}
			{...rest}
		/>
	);
}
