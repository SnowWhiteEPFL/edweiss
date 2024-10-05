import ReactComponent from '@/constants/Component';

import { ContainerProps, computeContainerStyle } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';
import { View, type ViewProps } from 'react-native';

export type TViewProps = ViewProps & ContainerProps;

const TView: ReactComponent<TViewProps> = ({ backgroundColor, style, ...props }) => {
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
	/>;
};

export default TView;
