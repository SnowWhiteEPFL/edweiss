import ReactComponent from '@/constants/Component';
import { ReactNode } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const TSafeArea: ReactComponent<{ children?: ReactNode }> = (props) => {
	return (
		<SafeAreaView>
			{props.children}
		</SafeAreaView>
	)
}

export default TSafeArea;
