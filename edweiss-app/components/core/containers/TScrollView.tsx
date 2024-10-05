import ReactComponent from '@/constants/Component';

import { ContainerProps, computeContainerStyle } from '@/constants/Style';
import { useOptionalColor, useOptionalThemeColor } from '@/hooks/theme/useThemeColor';
import { ScrollView, type ScrollViewProps } from 'react-native';

export type TScrollViewProps = ScrollViewProps & ContainerProps;

const TScrollView: ReactComponent<TScrollViewProps> = ({ style, ...props }) => {
	const computedBackgroundColor = useOptionalThemeColor({ light: props.light, dark: props.dark }, props.backgroundColor);
	const computedBorderColor = useOptionalColor(props.borderColor);

	return <ScrollView
		style={
			[
				computeContainerStyle(props, computedBackgroundColor, computedBorderColor),
				style
			]
		}
		{...props}
	/>;
};

export default TScrollView;
