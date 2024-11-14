import { ViewStyle } from 'react-native';

export type PredefinedSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PredefinedSizes = Record<PredefinedSize, number>;

export type Size = number | PredefinedSize;

export interface PaddingProps {
	p?: Size,
	pt?: Size,
	pb?: Size,
	pl?: Size,
	pr?: Size,
	px?: Size,
	py?: Size;
}

export interface MarginProps {
	m?: Size,
	mt?: Size,
	mb?: Size,
	ml?: Size,
	mr?: Size,
	mx?: Size,
	my?: Size;
}

export interface BorderProps {
	b?: Size,
	bt?: Size,
	bb?: Size,
	bl?: Size,
	br?: Size,
}

export type BoxModelProps = PaddingProps & MarginProps & BorderProps;

export const marginSizes: PredefinedSizes = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 32,
	xl: 64
};

export const paddingSizes: PredefinedSizes = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32
};

export const borderSizes: PredefinedSizes = {
	xs: 0.25,
	sm: 0.5,
	md: 1,
	lg: 1.5,
	xl: 2
};

export const textSizes: PredefinedSizes = {
	xs: 12,
	sm: 14,
	md: 16,
	lg: 20,
	xl: 28
};

export const iconSizes: PredefinedSizes = {
	xs: 18,
	sm: 22,
	md: 26,
	lg: 30,
	xl: 34
};

export const lineHeightSizes: PredefinedSizes = {
	xs: 16,
	sm: 20,
	md: 24,
	lg: 28,
	xl: 32
};

export const radiusSizes: PredefinedSizes = {
	xs: 2,
	sm: 4,
	md: 8,
	lg: 16,
	xl: 9999
};

export const gapSizes: PredefinedSizes = {
	xs: 2,
	sm: 4,
	md: 8,
	lg: 16,
	xl: 24
};

export function computeSize(size: Size, sizes: PredefinedSizes): number {
	if (typeof size == 'number')
		return size;
	return sizes[size];
}

export function computeSizeOpt(size: Size | undefined, sizes: PredefinedSizes): number | undefined {
	if (size == undefined)
		return undefined;
	return computeSize(size, sizes);
}

export function computePaddings(paddings: PaddingProps): ViewStyle {
	return {
		padding: computeSizeOpt(paddings.p, paddingSizes),
		paddingTop: computeSizeOpt(paddings.pt, paddingSizes),
		paddingBottom: computeSizeOpt(paddings.pb, paddingSizes),
		paddingLeft: computeSizeOpt(paddings.pl, paddingSizes),
		paddingRight: computeSizeOpt(paddings.pr, paddingSizes),
		paddingHorizontal: computeSizeOpt(paddings.px, paddingSizes),
		paddingVertical: computeSizeOpt(paddings.py, paddingSizes)
	};
}

export function computeMargins(margins: MarginProps): ViewStyle {
	return {
		margin: computeSizeOpt(margins.m, marginSizes),
		marginTop: computeSizeOpt(margins.mt, marginSizes),
		marginBottom: computeSizeOpt(margins.mb, marginSizes),
		marginLeft: computeSizeOpt(margins.ml, marginSizes),
		marginRight: computeSizeOpt(margins.mr, marginSizes),
		marginHorizontal: computeSizeOpt(margins.mx, marginSizes),
		marginVertical: computeSizeOpt(margins.my, marginSizes)
	};
}

export function computeBorders(borders: BorderProps): ViewStyle {
	return {
		borderWidth: computeSizeOpt(borders.b, borderSizes),
		borderTopWidth: computeSizeOpt(borders.bt, borderSizes),
		borderBottomWidth: computeSizeOpt(borders.bb, borderSizes),
		borderLeftWidth: computeSizeOpt(borders.bl, borderSizes),
		borderRightWidth: computeSizeOpt(borders.br, borderSizes),
	};
}

export function computeBoxModelSize(box: BoxModelProps) {
	return { ...computePaddings(box), ...computeMargins(box), ...computeBorders(box) };
}
