import { PredefinedSizes, computeBorders, computeMargins, computePaddings, computeSize, computeSizeOpt } from '@/constants/Sizes';
import { ViewStyle } from 'react-native';

describe("Sizes", () => {
	const sizes: PredefinedSizes = {
		xs: 1,
		sm: 2,
		md: 3,
		lg: 4,
		xl: 5
	};

	it("should correctly compute sizes", () => {
		expect(computeSize("xs", sizes)).toBe(sizes.xs);
		expect(computeSize("sm", sizes)).toBe(sizes.sm);
		expect(computeSize("md", sizes)).toBe(sizes.md);
		expect(computeSize("lg", sizes)).toBe(sizes.lg);
		expect(computeSize("xl", sizes)).toBe(sizes.xl);
	});

	it("should correctly compute optional sizes", () => {
		expect(computeSizeOpt(undefined, sizes)).toBe(undefined);
		expect(computeSizeOpt("xs", sizes)).toBe(sizes.xs);
		expect(computeSizeOpt("sm", sizes)).toBe(sizes.sm);
		expect(computeSizeOpt("md", sizes)).toBe(sizes.md);
		expect(computeSizeOpt("lg", sizes)).toBe(sizes.lg);
		expect(computeSizeOpt("xl", sizes)).toBe(sizes.xl);
	});

	it("should correctly compute margins", () => {
		const margins1 = computeMargins({
			m: 1,
			ml: 2,
			mr: 3,
			mb: 4,
			mt: 5,
			mx: 6,
			my: 7
		});

		expect(margins1).toStrictEqual<ViewStyle>({
			margin: 1,
			marginLeft: 2,
			marginRight: 3,
			marginBottom: 4,
			marginTop: 5,
			marginHorizontal: 6,
			marginVertical: 7
		});

		const margins2 = computeMargins({
			mx: 10,
			my: 20
		});

		expect(margins2).toStrictEqual<ViewStyle>({
			margin: undefined,
			marginLeft: undefined,
			marginRight: undefined,
			marginBottom: undefined,
			marginTop: undefined,
			marginHorizontal: 10,
			marginVertical: 20
		});
	});

	it("should correctly compute paddings", () => {
		const paddings1 = computePaddings({
			p: 1,
			pl: 2,
			pr: 3,
			pb: 4,
			pt: 5,
			px: 6,
			py: 7
		});

		expect(paddings1).toStrictEqual<ViewStyle>({
			padding: 1,
			paddingLeft: 2,
			paddingRight: 3,
			paddingBottom: 4,
			paddingTop: 5,
			paddingHorizontal: 6,
			paddingVertical: 7
		});

		const paddings2 = computePaddings({
			px: 10,
			py: 20
		});

		expect(paddings2).toStrictEqual<ViewStyle>({
			padding: undefined,
			paddingLeft: undefined,
			paddingRight: undefined,
			paddingBottom: undefined,
			paddingTop: undefined,
			paddingHorizontal: 10,
			paddingVertical: 20
		});
	});

	it("should correctly compute borders", () => {
		const borders1 = computeBorders({
			b: 1,
			bl: 2,
			br: 3,
			bb: 4,
			bt: 5
		});

		expect(borders1).toStrictEqual<ViewStyle>({
			borderWidth: 1,
			borderLeftWidth: 2,
			borderRightWidth: 3,
			borderBottomWidth: 4,
			borderTopWidth: 5
		});
	});
});