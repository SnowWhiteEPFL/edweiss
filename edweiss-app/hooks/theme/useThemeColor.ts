
import Colors, { Color, LightDarkProps } from '@/constants/Colors';
import useTheme from './useTheme';

export default function useThemeColor(props: LightDarkProps, colorName: Color) {
	const theme = useTheme();
	const colorFromProps = props[theme];

	if (colorFromProps) {
		return colorFromProps;
	} else {
		return Colors[theme][colorName];
	}
}

export function useOptionalThemeColor(props: LightDarkProps, colorName?: Color) {
	const theme = useTheme();
	const colorFromProps = props[theme];

	if (colorName == undefined)
		return undefined;

	if (colorFromProps) {
		return colorFromProps;
	} else {
		return Colors[theme][colorName];
	}
}

export function useColor(colorName: Color) {
	const theme = useTheme();
	return Colors[theme][colorName];
}

export function useOptionalColor(colorName?: Color) {
	const theme = useTheme();
	if (colorName == undefined)
		return undefined;
	return Colors[theme][colorName];
}
