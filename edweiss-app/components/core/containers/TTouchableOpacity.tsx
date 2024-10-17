import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';

import ReactComponent from '@/constants/Component';
import { ContainerProps, computeContainerStyle } from '@/constants/Style';

export type TTouchableOpacityProps = TouchableOpacityProps & ContainerProps;

const TTouchableOpacity: ReactComponent<TTouchableOpacityProps> = ({ style, ...props }) => {
	//const computedBackgroundColor = useOptionalThemeColor({ light: props.light, dark: props.dark }, props.backgroundColor);
	//const computedBorderColor = useOptionalColor(props.borderColor);
	const computedBackgroundColor = props.backgroundColor;
	const computedBorderColor = props.borderColor;

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
};

export default TTouchableOpacity;
