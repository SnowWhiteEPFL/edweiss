import React, { ReactNode } from 'react'
import TView from '../containers/TView'

const HeaderButtons = (props: { children?: ReactNode }) => {
	return (
		<TView flexDirection={'row-reverse'} mr={13}>
			{props.children}
		</TView>
	)
}

export default HeaderButtons