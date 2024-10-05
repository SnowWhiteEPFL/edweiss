import ReactComponent from '@/constants/Component';

import React, { ReactNode } from 'react';
import TView from '../containers/TView';

const HeaderButtons: ReactComponent<{ children?: ReactNode; }> = (props) => {
	return (
		<TView flexDirection={'row-reverse'} mr={13}>
			{props.children}
		</TView>
	);
};

export default HeaderButtons;