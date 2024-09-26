
export function sum(numbers: number[]) {
	return numbers.reduce((res, a) => res + a, 0);
}

export function average(numbers: number[]) {
	if (numbers.length == 0)
		return 0;
	return sum(numbers) / numbers.length;
}
