import { Color } from '@/constants/Colors';
import { MarginProps, PredefinedSizes, Size, computeMargins, computeSize } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { Testable } from '@/constants/Tests';
import useThemeColor from '@/hooks/theme/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { StyleProp, TextStyle } from 'react-native';

export type IconProps = MarginProps & Testable & {
	name: IconType,
	size?: Size,
	color?: Color,
	light?: string,
	dark?: string,
	style?: StyleProp<TextStyle>
};

export default function Icon({ name, size = 16, color = 'subtext0', light, dark, style, testID, ...rest }: IconProps) {
	const computedColor = useThemeColor({ light, dark }, color);

	return <Ionicons
		name={name}
		size={computeSize(size, iconSizes)}
		color={computedColor}
		style={[computeMargins(rest), style]}
		testID={testID}
	/>
}

const iconSizes: PredefinedSizes = {
	xs: 10,
	sm: 12,
	md: 16,
	lg: 20,
	xl: 28
}
