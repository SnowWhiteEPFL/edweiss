import ReactComponent from '@/constants/Component';

import { Color } from '@/constants/Colors';
import { MarginProps, computeMargins } from '@/constants/Sizes';
import { ContainerStyle, IconType } from '@/constants/Style';
import { Testable } from '@/constants/Tests';
import { ReactNode } from 'react';
import Icon from '../core/Icon';
import TActivityIndicator from '../core/TActivityIndicator';
import TText from '../core/TText';
import TTouchableOpacity from '../core/containers/TTouchableOpacity';

type FancyButtonProps = MarginProps & Testable & {
	backgroundColor?: Color,
	textColor?: Color,
	style?: ContainerStyle,
	icon?: IconType,
	outlined?: boolean;

	onPress?(): void,
	children?: ReactNode,
	loading?: boolean,
	disabled?: boolean,
};

const FancyButton: ReactComponent<FancyButtonProps> = ({ backgroundColor = 'blue', textColor = 'crust', outlined, loading, ...props }) => {
	const computedBackgroundColor = outlined ? 'transparent' : backgroundColor;
	const computedTextColor = outlined ? backgroundColor : textColor;
	const computedBorderWidth = 1;

	return (
		<TTouchableOpacity onPress={props.onPress} disabled={loading || props.disabled} backgroundColor={computedBackgroundColor} borderColor={backgroundColor} flexDirection='row' justifyContent='center' columnGap={'md'} alignItems='center' radius={'xl'} pt={12} pb={12} b={computedBorderWidth} style={[computeMargins({ mx: "md", ...props }), props.style]} testID={props.testID}>
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
	);
};

export default FancyButton;