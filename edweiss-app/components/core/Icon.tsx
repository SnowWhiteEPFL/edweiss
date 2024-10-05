import ReactComponent from '@/constants/Component';

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
	style?: StyleProp<TextStyle>;
};

const Icon: ReactComponent<IconProps> = ({ name, size = 16, color = 'subtext0', light, dark, style, testID, ...props }) => {
	const computedColor = useThemeColor({ light, dark }, color);

	return <Ionicons
		name={name}
		size={computeSize(size, iconSizes)}
		color={computedColor}
		style={[computeMargins(props), style]}
		testID={testID}
	/>;
};

export default Icon;

const iconSizes: PredefinedSizes = {
	xs: 10,
	sm: 12,
	md: 16,
	lg: 20,
	xl: 28
};
