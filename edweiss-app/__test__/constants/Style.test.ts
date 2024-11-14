
import { computeContainerStyle } from '@/constants/Style';

describe("Style", () => {
	it("should correctly compute container styles", () => {
		const style = computeContainerStyle({
			radius: 10,
			alignItems: "flex-start",
			justifyContent: "space-between",
			flexColumnGap: 13,
			flexRowGap: 15
		}, "red", "blue");

		expect(style.borderRadius).toBe(10);
		expect(style.alignItems).toBe("flex-start");
		expect(style.justifyContent).toBe("space-between");
		expect(style.columnGap).toBe(13);
		expect(style.rowGap).toBe(15);
	});
});
