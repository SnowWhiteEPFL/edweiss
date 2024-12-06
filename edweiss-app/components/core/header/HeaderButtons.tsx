import ReactComponent from '@/constants/Component';

import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import TView from '../containers/TView';

const HeaderButtons: ReactComponent<{ children?: ReactNode, style?: StyleProp<ViewStyle> }> = (props) => {
	return (
		<TView flexDirection={'row-reverse'} mr={13} style={props.style}>
			{props.children}
		</TView>
	);
};

export default HeaderButtons;