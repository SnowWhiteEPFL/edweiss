import { Ionicons } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';
import { Color, LightDarkProps } from './Colors';
import { BoxModelProps, Size, computeSizeOpt, gapSizes, radiusSizes } from './Sizes';

export type IconType = keyof typeof Ionicons.glyphMap;

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type JustifyContent = "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "space-evenly";

export type AlignItems = "center" | "flex-start" | "flex-end" | "stretch" | "baseline";

export type ContainerProps = & LightDarkProps & BoxModelProps & {
	backgroundColor?: Color,
	flex?: boolean,
	flexDirection?: FlexDirection,
	justifyContent?: JustifyContent,
	alignItems?: AlignItems,
	rowGap?: Size,
	columnGap?: Size,
	radius?: Size,
	borderColor?: Color,
};

export type ContainerStyle = StyleProp<ViewStyle>

export function computeContainerStyle(props: ContainerProps, backgroundColor: string, borderColor: string) {
	return {
		backgroundColor,
		display: props.flex ? 'flex' : undefined,
		flexDirection: props.flexDirection,
		borderRadius: computeSizeOpt(props.radius, radiusSizes),
		borderColor,
		justifyContent: props.justifyContent,
		alignItems: props.alignItems,
		rowGap: computeSizeOpt(props.rowGap, gapSizes),
		columnGap: computeSizeOpt(props.columnGap, gapSizes),
	}
}
