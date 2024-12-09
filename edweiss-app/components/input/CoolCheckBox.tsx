import ReactComponent, { Setter } from '@/constants/Component';

import TView from '@/components/core/containers/TView';
import { Size } from '@/constants/Sizes';
import { useColor } from '@/hooks/theme/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { SvgProps } from 'react-native-svg';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';

interface CheckboxProps {
	value?: boolean,
	onChange?: Setter<boolean>,
	label?: React.ReactNode,
	icon?: FC<SvgProps>,
	disabled?: boolean,
	px?: Size
}

const Checkbox: ReactComponent<CheckboxProps> = (props) => {
	return (
		<TTouchableOpacity disabled={props.disabled} px={props.px ?? 'lg'} py={'sm'} activeOpacity={0.9} flexDirection='row' alignItems='center' flexColumnGap={16} onPress={() => props.onChange && props.onChange(bool => !bool)}>
			<CheckboxDisplay checked={props.value} />
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

export const CheckboxDisplay: ReactComponent<{ size?: number, checked?: boolean }> = ({ checked, size = 28 }) => {
	const color = useColor('crust')

	return (
		<TView
			flexDirection='row' alignItems='center' justifyContent='center'
			backgroundColor={checked ? 'blue' : 'transparent'}
			radius={size / 2.8} b={1} borderColor={checked ? 'transparent' : 'subtext1'}
			style={{ width: size, height: size }}>
			<Ionicons name='checkmark' color={checked ? color : 'transparent'} size={size - 7} />
		</TView>
	);
};