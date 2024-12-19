import ReactComponent, { Setter } from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import { Color } from '@/constants/Colors';
import { Size } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { useColor } from '@/hooks/theme/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';

interface CheckboxProps {
	value?: boolean,
	onChange?: Setter<boolean>,
	label?: React.ReactNode,
	prelabel?: React.ReactNode,
	icon?: FC<SvgProps>,
	disabled?: boolean,
	px?: Size,
	color?: Color,
	activeColor?: Color,
	borderWidth?: number,
	correct?: boolean,
	iconName?: IconType
}

const Checkbox: ReactComponent<CheckboxProps> = (props) => {
	return (
		<TTouchableOpacity disabled={props.disabled} px={props.px ?? 'lg'} py={'sm'} activeOpacity={0.9} flexDirection='row' alignItems='center' flexColumnGap={16} onPress={() => props.onChange && props.onChange(bool => !bool)}>
			{
				props.prelabel &&
				<TView>
					{props.prelabel}
				</TView>
			}
			<CheckboxDisplay checked={props.value} color={props.color} activeColor={props.activeColor} borderWidth={props.borderWidth} iconName={props.iconName} />
			{
				props.icon &&
				<props.icon color={'black'} width={20} height={20} />
			}
			{
				props.label &&
				<TView flex={1}>
					{props.label}
				</TView>
			}
		</TTouchableOpacity>
	);
};

export default Checkbox;

export const CheckboxDisplay: ReactComponent<{ size?: number, checked?: boolean, color?: Color, activeColor?: Color, borderWidth?: number, iconName?: IconType }> = ({ checked, size = 28, color = "crust", activeColor = "blue", borderWidth = 1, iconName = "checkmark" }) => {
	const computedColor = useColor(color);


	return (
		<TView
			flexDirection='row' alignItems='center' justifyContent='center'
			backgroundColor={checked ? activeColor : 'transparent'}
			radius={size / 2.8} b={borderWidth} borderColor={checked ? 'transparent' : activeColor}
			style={{ width: size, height: size }}>
			<Ionicons name={iconName} color={checked ? computedColor : 'transparent'} size={size - 7} />
		</TView>
	);
};