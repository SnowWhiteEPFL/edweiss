import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import TText from './core/TText';
import TView from './core/containers/TView';

const Avatar = (props: { name: string, size: number, style?: StyleProp<ViewStyle> }) => {
	if (props.name == undefined)
		return <></>;

	const wrds = props.name.split(' ');

	let name = '';
	for (let index = 0; index < Math.min(2, wrds.length); index++)
		name += wrds[index].charAt(0);

	const size = props.size;

	return (
		<TView backgroundColor='blue' style={[{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: size, borderRadius: 9999, aspectRatio: 1 }, props.style]}>
			<TText color='crust' style={{ fontWeight: 'ultralight', fontSize: 24 * (size / 60), letterSpacing: 1 }}>
				{name}
			</TText>
		</TView>
	)
}

export default Avatar