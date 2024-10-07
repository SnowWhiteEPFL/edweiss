import { average, sum } from '@/utils/math';

describe("math", () => {
	it("generic sum", () => {
		const input = [1, 2, 3, 4];
		const res = sum(input);

		expect(res).toBe(10);
	});

	it("summing over nothing", () => {
		const input: number[] = [];
		const res = sum(input);

		expect(res).toBe(0);
	});

	it("generic average", () => {
		const input = [1, 2, 3, 4];
		const res = average(input);

		expect(res).toBe(2.5);
	});

	it("averaging over nothing", () => {
		const input: number[] = [];
		const res = average(input);

		expect(res).toBe(0);
	});
});
