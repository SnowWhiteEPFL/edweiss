import { Color } from '@/constants/Colors';
import ReactComponent from '@/constants/Component';
import { MarginProps } from '@/constants/Sizes';
import { IconType } from '@/constants/Style';
import { Testable } from '@/constants/Tests';
import { useColor } from '@/hooks/theme/useThemeColor';

import { TextInput } from 'react-native';
import Icon from '../core/Icon';
import TText from '../core/TText';
import TView from '../core/containers/TView';

type FancyTextInputProps = MarginProps & Testable & {
	value?: string;
	onChangeText?: (text: string) => void;
	placeholder?: string;
	backgroundColor?: Color;
	textColor?: Color;
	placeholderColor?: Color;
	icon?: IconType;
	multiline?: boolean;
	numberOfLines?: number;
	readOnly?: boolean;
	label?: string;
	error?: string;
};

const FancyTextInput: ReactComponent<FancyTextInputProps> = ({ backgroundColor = 'crust', textColor = 'text', placeholderColor = 'overlay0', multiline, ...props }) => {
	const computedTextColor = useColor(textColor);
	const computedPlaceholderColor = useColor(placeholderColor);
	const hasError = props.error != undefined;

	return (
		<TView
			mt={props.mt} mb={props.mb}
			ml={props.ml} mr={props.mr}
			my={props.my}
			mx={props.mx ?? 'md'}
		>
			<TView
				borderColor={hasError ? 'red' : backgroundColor}
				b={1}
				backgroundColor={backgroundColor}
				radius={14}
				py={12}
			>
				{
					props.label &&
					<TText ml={16} mb={4} size={'sm'} color='overlay2'>
						{props.label}
					</TText>
				}
				<TView flexDirection='row'>
					{
						props.icon && <TView flexDirection='column' justifyContent={multiline ? 'flex-start' : 'center'} alignItems='center' py={3} ml={12} mr={-6}>
							<Icon name={props.icon} size={20} color={placeholderColor} />
						</TView>
					}
					<TextInput
						style={
							{
								// backgroundColor: "#000",
								color: computedTextColor,
								paddingTop: multiline ? 3 : 0,
								// paddingVertical: 8,
								paddingHorizontal: 16,
								fontFamily: "Inter",
								flex: 1,
								fontSize: 16,
								lineHeight: 24
							}
						}
						value={props.value}
						onChangeText={props.onChangeText}
						placeholder={props.placeholder}
						placeholderTextColor={computedPlaceholderColor}
						multiline={multiline}
						numberOfLines={props.numberOfLines}
						readOnly={props.readOnly}
						textAlignVertical={multiline ? 'top' : 'center'}
						testID={props.testID}
					/>
				</TView>
			</TView>
			{
				props.error &&
				<TText mt={'xs'} ml={'xs'} mb={'sm'} size={'md'} color='red'>
					{props.error}
				</TText>
			}
		</TView>
	);
};

export default FancyTextInput;
