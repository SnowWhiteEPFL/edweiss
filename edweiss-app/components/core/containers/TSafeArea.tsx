import ReactComponent from '@/constants/Component';
import { ContainerStyle } from '@/constants/Style';

import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const TSafeArea: ReactComponent<{ children?: ReactNode; style?: ContainerStyle }> = (props) => {
	return (
		<SafeAreaView style={props.style}>
			{props.children}
		</SafeAreaView>
	);
};

export default TSafeArea;
