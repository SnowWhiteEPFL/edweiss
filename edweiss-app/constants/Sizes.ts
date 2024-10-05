
export type PredefinedSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type PredefinedSizes = Record<PredefinedSize, number>;

export type Size = number | PredefinedSize;

export interface PaddingProps {
	p?: Size,
	pt?: Size,
	pb?: Size,
	pl?: Size,
	pr?: Size,
	ph?: Size,
	pv?: Size;
}

export interface MarginProps {
	m?: Size,
	mt?: Size,
	mb?: Size,
	ml?: Size,
	mr?: Size,
	mh?: Size,
	mv?: Size;
}

export interface BorderProps {
	b?: Size,
	bt?: Size,
	bb?: Size,
	bl?: Size,
	br?: Size,
	bh?: Size,
	bv?: Size;
}

export type BoxModelProps = PaddingProps & MarginProps & BorderProps;

const marginSizes: PredefinedSizes = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 32,
	xl: 64
};

const paddingSizes: PredefinedSizes = {
	xs: 4,
	sm: 8,
	md: 16,
	lg: 24,
	xl: 32
};

const borderSizes: PredefinedSizes = {
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

export function computePaddings(paddings: PaddingProps) {
	const p = computeSizeOpt(paddings.p, paddingSizes);
	const ph = computeSizeOpt(paddings.ph, paddingSizes);
	const pv = computeSizeOpt(paddings.pv, paddingSizes);

	return {
		padding: p,
		paddingTop: paddings.pt == undefined ? (pv ?? p) : computeSizeOpt(paddings.pt, paddingSizes),
		paddingBottom: paddings.pb == undefined ? (pv ?? p) : computeSizeOpt(paddings.pb, paddingSizes),
		paddingLeft: paddings.pl == undefined ? (ph ?? p) : computeSizeOpt(paddings.pl, paddingSizes),
		paddingRight: paddings.pr == undefined ? (ph ?? p) : computeSizeOpt(paddings.pr, paddingSizes),
	};
}

export function computeMargins(margins: MarginProps) {
	const m = computeSizeOpt(margins.m, marginSizes);
	const mh = computeSizeOpt(margins.mh, marginSizes);
	const mv = computeSizeOpt(margins.mv, marginSizes);

	return {
		margin: m,
		marginTop: margins.mt == undefined ? (mv ?? m) : computeSizeOpt(margins.mt, marginSizes),
		marginBottom: margins.mb == undefined ? (mv ?? m) : computeSizeOpt(margins.mb, marginSizes),
		marginLeft: margins.ml == undefined ? (mh ?? m) : computeSizeOpt(margins.ml, marginSizes),
		marginRight: margins.mr == undefined ? (mh ?? m) : computeSizeOpt(margins.mr, marginSizes),
	};
}

export function computeBorders(borders: BorderProps) {
	const b = computeSizeOpt(borders.b, borderSizes);
	const bh = computeSizeOpt(borders.bh, borderSizes);
	const bv = computeSizeOpt(borders.bv, borderSizes);

	return {
		borderWidth: b,
		borderTopWidth: borders.bt == undefined ? (bv ?? b) : computeSizeOpt(borders.bt, borderSizes),
		borderBottomWidth: borders.bb == undefined ? (bv ?? b) : computeSizeOpt(borders.bb, borderSizes),
		borderLeftWidth: borders.bl == undefined ? (bh ?? b) : computeSizeOpt(borders.bl, borderSizes),
		borderRightWidth: borders.br == undefined ? (bh ?? b) : computeSizeOpt(borders.br, borderSizes),
	};
}

export function computeBoxModelSize(box: BoxModelProps) {
	return { ...computePaddings(box), ...computeMargins(box), ...computeBorders(box) };
}
