import ReactComponent from '@/constants/Component';

import { Color, LightDarkProps } from '@/constants/Colors';
import { BoxModelProps, Size, computeBoxModelSize, computeSize, computeSizeOpt, lineHeightSizes, textSizes } from '@/constants/Sizes';
import useThemeColor from '@/hooks/theme/useThemeColor';
import { Text, type TextProps } from 'react-native';

export type TTextProps = TextProps & LightDarkProps & BoxModelProps & {
	color?: Color,
	size?: Size,
	bold?: boolean,
	underlined?: boolean,
	lineHeight?: Size,
	align?: "auto" | "left" | "right" | "center" | "justify";
};

const TText: ReactComponent<TTextProps> = ({ style, light, dark, size = 'md', bold = false, underlined = false, lineHeight = undefined, color = 'text', align, ...props }) => {
	const computedColor = useThemeColor({ light, dark }, color);

	return (
		<Text
			style={[
				{
					color: computedColor,
					fontSize: computeSize(size, textSizes),
					lineHeight: computeSizeOpt(lineHeight, lineHeightSizes),
					// fontWeight: bold ? 'bold' : 'normal',
					textDecorationLine: underlined ? 'underline' : 'none',
					textAlign: align,
					fontFamily: bold ? "Inter-SemiBold" : "Inter-Regular",
				},
				computeBoxModelSize(props),
				style
			]}
			{...props}
		/>
	);
};

export default TText;