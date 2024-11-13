import ReactComponent from '@/constants/Component';

import { Color } from '@/constants/Colors';
import { IconType } from '@/constants/Style';
import { Testable } from '@/constants/Tests';
import React from 'react';
import Icon from '../Icon';
import TTouchableOpacity from '../containers/TTouchableOpacity';

type HeaderButtonProps = Testable & {
	icon: IconType;
	color?: Color;
	onPress?: () => void;
	testID?: string;
};

const HeaderButton: ReactComponent<HeaderButtonProps> = ({ color = "text", testID, ...props }) => {
	return (
		<TTouchableOpacity onPress={props.onPress} ml={12} testID={testID}>
			<Icon name={props.icon} size={28} color={color} />
		</TTouchableOpacity>
	);
};

export default HeaderButton;