import { Color } from '@/constants/Colors'
import { MarginProps, computeMargins } from '@/constants/Sizes'
import { ContainerStyle, IconType } from '@/constants/Style'
import { ReactNode, useState } from 'react'
import Icon from '../core/Icon'
import { TActivityIndicator } from '../core/TActivityIndicator'
import { TText } from '../core/TText'
import { TTouchableOpacity } from '../core/TTouchableOpacity'

interface FancyButtonProps {
	backgroundColor?: Color,
	textColor?: Color,
	style?: ContainerStyle,
	icon?: IconType,
	outlined?: boolean

	onPress?(): Promise<void> | void,
	children?: ReactNode,
	loading?: boolean,
	disabled?: boolean,

	disableInnerLoading?: boolean
}

const FancyButton = ({ backgroundColor = 'blue', textColor = 'white', outlined, ...props }: FancyButtonProps & MarginProps) => {
	const [innerLoading, setLoading] = useState(false);

	const loading = (innerLoading && props.disableInnerLoading != true) || props.loading;

	const computedBackgroundColor = outlined ? 'transparent' : backgroundColor;
	const computedTextColor = outlined ? backgroundColor : textColor;
	const computedBorderWidth = outlined ? 1 : 0;

	async function onPress() {
		setLoading(true);
		if (props.onPress)
			await props.onPress();
		setLoading(false);
	}

	return (
		<TTouchableOpacity onPress={onPress} disabled={loading || props.disabled} backgroundColor={computedBackgroundColor} flex flexDirection='row' justifyContent='center' columnGap={'md'} alignItems='center' radius={'xl'} pt={12} pb={12} style={[{ borderWidth: computedBorderWidth, borderColor: backgroundColor }, computeMargins(props), props.style]}>
			{
				loading ?
					<TActivityIndicator size={24} color={computedTextColor} /> :
					<>
						{props.icon && <Icon name={props.icon} color={computedTextColor} size={'lg'} />}
						<TText align='center' color={computedTextColor}>
							{props.children}
						</TText>
					</>
			}
		</TTouchableOpacity>
	)
}

export default FancyButton