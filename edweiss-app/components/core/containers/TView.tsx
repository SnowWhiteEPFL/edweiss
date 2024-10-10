import ReactComponent from '@/constants/Component';

import { ContainerProps, computeContainerStyle } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';
import { View, type ViewProps } from 'react-native';

export type TViewProps = ViewProps & ContainerProps;

const TView: ReactComponent<TViewProps> = ({ backgroundColor, borderColor, style, columnGap = 0, rowGap = 0, ...props }) => {
	const computedBackgroundColor = useOptionalThemeColor({ light: props.light, dark: props.dark }, backgroundColor);
	const computedBorderColor = useOptionalColor(borderColor);

	return <View
		style={
			[
				computeContainerStyle(props, computedBackgroundColor, computedBorderColor),
				style
			]
		}
		{...props}
	/>;
};

export default TView;
