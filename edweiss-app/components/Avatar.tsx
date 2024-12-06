import ReactComponent from '@/constants/Component';
import { UserID } from '@/model/users';
import React, { ReactNode } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Icon from './core/Icon';
import TText from './core/TText';
import TView from './core/containers/TView';

const Avatar: ReactComponent<{ name?: string, size: number, style?: StyleProp<ViewStyle>, uid?: UserID }> = (props) => {
	if (props.name == undefined)
		return (
			<BaseAvatar size={props.size} style={props.style}>
				<Icon name='person' color='crust' size={10 * props.size / 20} />
			</BaseAvatar>
		);

	const wrds = props.name.split(' ');

	let name = '';
	for (let index = 0; index < Math.min(2, wrds.length); index++)
		name += wrds[index].charAt(0);

	const size = props.size;

	return (
		<BaseAvatar size={props.size} style={props.style}>
			<TText color='crust' style={{ fontWeight: 'ultralight', fontSize: 24 * (size / 60), letterSpacing: 1 }}>
				{name}
			</TText>
		</BaseAvatar>
	)
}

export default Avatar

const BaseAvatar: ReactComponent<{ children?: ReactNode, size: number, style?: StyleProp<ViewStyle> }> = ({ children, size, style }) => {
	return (
		<TView backgroundColor='blue' style={[{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: size, borderRadius: 9999, aspectRatio: 1 }, style]}>
			{children}
		</TView>
	);
};