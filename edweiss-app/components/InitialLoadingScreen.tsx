import EdweissLogo from '@/assets/images/edweiss2.svg';
import Colors from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import useTheme from '@/hooks/theme/useTheme';
import { useWindowDimensions } from 'react-native';
import TActivityIndicator from './core/TActivityIndicator';
import TView from './core/containers/TView';

export const LoadingPageCompoment: ReactComponent<{}> = () => {
	const { width } = useWindowDimensions();

	const theme = useTheme();

	return (
		<TView backgroundColor='mantle' style={{ flex: 1 }} pl={'lg'} pr={'lg'}>
			<TView flex={1} justifyContent='flex-start' alignItems='center' mt={90} mb={20}>
				<EdweissLogo />
				<TView my={144} alignItems='center'>
					<EdweissLogo color={Colors[theme].text} width={width * 0.6} />

					<TActivityIndicator size={36} color='blue' mt={100} mb={70} testID='load-indicator' />
				</TView>
			</TView>
		</TView>
	);
};
