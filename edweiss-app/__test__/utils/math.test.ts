import { average, sum } from '@/utils/math';

describe("math", () => {
	it("should sum", () => {
		const input = [1, 2, 3, 4];
		const res = sum(input);

		expect(res).toBe(10);
	});

	it("should return 0 when summing an empty array", () => {
		const input: number[] = [];
		const res = sum(input);

		expect(res).toBe(0);
	});

	it("should average", () => {
		const input = [1, 2, 3, 4];
		const res = average(input);

		expect(res).toBe(2.5);
	});

	it("should return 0 when averaging an empty array", () => {
		const input: number[] = [];
		const res = average(input);

		expect(res).toBe(0);
	});
});
