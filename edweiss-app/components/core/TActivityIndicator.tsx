import ReactComponent from '@/constants/Component';

import { Color, LightDarkProps } from '@/constants/Colors';
import { BoxModelProps, Size, computeBoxModelSize } from '@/constants/Sizes';
import useThemeColor from '@/hooks/theme/useThemeColor';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

export type TActivityIndicatorProps = ActivityIndicatorProps & LightDarkProps & BoxModelProps & {
	color?: Color,
	size?: Size,
};

const TActivityIndicator: ReactComponent<TActivityIndicatorProps> = ({ style, light, dark, color = 'text', ...props }) => {
	const computedColor = useThemeColor({ light, dark }, color);

	return (
		<ActivityIndicator
			color={computedColor}
			style={[
				computeBoxModelSize(props),
				style
			]}
			{...props}
		/>
	);
};

export default TActivityIndicator;
