import { Color } from '@/constants/Colors'
import { IconType } from '@/constants/Style'
import React from 'react'
import Icon from '../Icon'
import TTouchableOpacity from '../containers/TTouchableOpacity'

const HeaderButton = ({ color = "text", ...props }: { icon: IconType, color?: Color, onPress?: () => void }) => {
	return (
		<TTouchableOpacity onPress={props.onPress} ml={12}>
			<Icon name={props.icon} size={28} color={color} />
		</TTouchableOpacity>
	)
}

export default HeaderButton