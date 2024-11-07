import ReactComponent from '@/constants/Component';

import { Color } from '@/constants/Colors';
import { IconType } from '@/constants/Style';
import React from 'react';
import Icon from '../Icon';
import TTouchableOpacity from '../containers/TTouchableOpacity';

const HeaderButton: ReactComponent<{ icon: IconType, color?: Color, onPress?: () => void; testID?: string; }> = ({ color = "text", testID, ...props }) => {
	return (
		<TTouchableOpacity onPress={props.onPress} ml={12} testID={testID}>
			<Icon name={props.icon} size={28} color={color} />
		</TTouchableOpacity>
	);
};

export default HeaderButton;