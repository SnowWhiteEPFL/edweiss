import { Ionicons } from '@expo/vector-icons';
import { StyleProp, ViewStyle } from 'react-native';
import { Color, LightDarkProps } from './Colors';
import { BoxModelProps, Size, computeBoxModelSize, computeSizeOpt, gapSizes, radiusSizes } from './Sizes';

export type IconType = keyof typeof Ionicons.glyphMap;

export type FlexDirection = 'row' | 'row-reverse' | 'column' | 'column-reverse';

export type JustifyContent = "center" | "flex-start" | "flex-end" | "space-between" | "space-around" | "space-evenly";

export type AlignItems = "center" | "flex-start" | "flex-end" | "stretch" | "baseline";

export type ContainerProps = & LightDarkProps & BoxModelProps & {
	backgroundColor?: Color,
	borderColor?: Color,
	flex?: number,
	flexDirection?: FlexDirection,
	justifyContent?: JustifyContent,
	alignItems?: AlignItems,
	rowGap?: Size,
	columnGap?: Size,
	radius?: Size,
};

export type ContainerStyle = StyleProp<ViewStyle>

export function computeContainerStyle(props: ContainerProps, backgroundColor: string | undefined, borderColor: string | undefined): ContainerStyle {
	return {
		backgroundColor,
		flex: props.flex,
		display: props.flexDirection != undefined ? 'flex' : undefined,
		flexDirection: props.flexDirection,
		borderRadius: computeSizeOpt(props.radius, radiusSizes),
		borderColor,
		justifyContent: props.justifyContent,
		alignItems: props.alignItems,
		rowGap: computeSizeOpt(props.rowGap, gapSizes),
		columnGap: computeSizeOpt(props.columnGap, gapSizes),
		...computeBoxModelSize(props)
	}
}
