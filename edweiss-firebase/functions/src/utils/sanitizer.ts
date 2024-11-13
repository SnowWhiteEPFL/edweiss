import { FailedCallResult } from 'model/functions';
import { INVALID_ARGUMENT, fail } from './status';

export type Predicate<T> = (t: T) => boolean;
export type CompositePredicate<T> = Predicate<T> | CompositePredicate<T>[];

type AssertionError = FailedCallResult<string> | string;
type Condition = boolean | (() => boolean) | boolean;
type PredicateOnFields<T> = { [x in keyof T]: CompositePredicate<T[x]> };

const DEFAULT_ASSERTION_ERROR = INVALID_ARGUMENT;

function throwable(error: AssertionError): FailedCallResult<string> {
	return typeof error == "string" ? fail(error) : error;
}

function computeCondition(condition: Condition): boolean {
	return typeof condition == "function" ? condition() : condition;
}

export function assert(condition: Condition, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	if (!computeCondition(condition))
		throw throwable(error);
}

export function assertThat<T>(t: T, predicates: CompositePredicate<T>, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assert(Predicate.verify(t, predicates), error);
}

export function assertThatFields<T extends object>(t: T, predicates: PredicateOnFields<T>, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(t, Predicate.isDefined);
	for (const key in predicates) {
		const predicate = predicates[key];

		if (predicate != undefined)
			assert(Predicate.verify(t[key], predicate), error);
	}
}

export function assertNumber(number: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isNumber, error);
}

export function assertString(string: string, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(string, Predicate.isString, error);
}

export function assertBoolean(boolean: boolean, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(boolean, Predicate.isBoolean, error);
}

export function assertObject(object: object, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(object, Predicate.isObject, error);
}

export function assertArray<T>(array: T[], error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(array, Predicate.isArray, error);
}

export function assertPositiveNumber(number: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isPositive, error);
}

export function assertStrictlyPositiveNumber(number: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isStrictlyPositive, error);
}

export function assertIsBetween(number: number, min: number, max: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isBetween(min, max), error);
}

export function assertNonEmptyString(string: string, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(string, Predicate.isNonEmptyString, error);
}

export function assertIsIn<T>(t: T, list: T[], error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertArray(list, error);
	assertThat(t, Predicate.isIn(list), error);
}

export function assertIsNotIn<T>(t: T, list: T[], error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertArray(list, error);
	assertThat(t, Predicate.isNotIn(list), error);
}

export function assertForEach<T>(list: T[], predicates: CompositePredicate<T>, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertArray(list, error);
	list.forEach(t => assert(Predicate.verify(t, predicates), error));
}

export namespace Predicate {

	export function is<const T>(value: T): Predicate<T> {
		return (t: T) => t === value;
	}

	export function isNot<T>(value: T): Predicate<T> {
		return (t: T) => t !== value;
	}

	export function isDefined<T>(t: T): boolean {
		return t != undefined;
	}

	export function isUndefined<T>(t: T | undefined): boolean {
		return t == undefined;
	}

	export function isNumber(x: number): boolean {
		return typeof x == "number";
	}

	export function isString(x: string): boolean {
		return typeof x == "string";
	}

	export function isBoolean(x: boolean): boolean {
		return typeof x == "boolean";
	}

	export function isObject(x: object): boolean {
		return typeof x == "object";
	}

	export function isArray<T>(x: T[]): boolean {
		return Array.isArray(x);
	}

	export function isOptionalNumber(x: number | undefined): boolean {
		return x == undefined || typeof x == "number";
	}

	export function isOptionalString(x: string | undefined): boolean {
		return x == undefined || typeof x == "string";
	}

	export function isOptionalBoolean(x: boolean | undefined): boolean {
		return x == undefined || typeof x == "boolean";
	}

	export function isOptionalObject(x: object | undefined): boolean {
		return x == undefined || typeof x == "object";
	}

	export function isOptionalArray<T>(x: T[] | undefined): boolean {
		return x == undefined || Array.isArray(x);
	}

	export function isPositive(x: number): boolean {
		return typeof x == "number" && x >= 0;
	}

	export function isStrictlyPositive(x: number): boolean {
		return typeof x == "number" && x > 0;
	}

	export function isNegative(x: number): boolean {
		return typeof x == "number" && x < 0;
	}

	export function isNonEmptyString(x: string): boolean {
		return typeof x == "string" && x.length > 0;
	};

	export function isMore(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x > threshold;
	}

	export function isMoreOrEqual(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x >= threshold;
	}

	export function isLess(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x < threshold;
	}

	export function isLessOrEqual(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x <= threshold;
	}

	export function isBetween(min: number, max: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x >= min && x <= max;
	}

	export function forEach<T>(...composites: CompositePredicate<T>[]): Predicate<T[]> {
		return (ts: T[]) => {
			if (ts == undefined || !Array.isArray(ts))
				return false;

			for (const t of ts) {
				if (!verify(t, composites))
					return false;
			}

			return true;
		}
	}

	export function isNonEmptyArray<T>(ts: T[]): boolean {
		return Array.isArray(ts) && ts.length > 0;
	}

	export function isIn<T>(list: T[]): Predicate<T> {
		return (t: T) => list.includes(t);
	}

	export function isNotIn<T>(list: T[]): Predicate<T> {
		return (t: T) => !list.includes(t);
	}

	export function isEither<T>(...composites: CompositePredicate<T>[]) {
		return (t: T) => {
			for (const composite of composites) {
				if (verify(t, composite))
					return true;
			}

			return false;
		}
	}

	export function isOptional<T>(...predicates: CompositePredicate<T>[]): Predicate<T | undefined> {
		return (t: T | undefined) => t == undefined || verify(t, predicates);
	}

	export function field<T, const K extends keyof T>(key: K, ...predicates: CompositePredicate<T[K]>[]): Predicate<T> {
		return (t: T) => t != undefined && verify(t[key], predicates);
	}

	type ValidKeyOf<T> = Extract<keyof T, string>;
	type Dispatchable = Record<string, any>;

	type WithGenericKey<T, K extends string, V> = T & { [key in K]: V };
	type PredicateToInferredType<T extends Dispatchable, Key extends ValidKeyOf<T>, Value> = CompositePredicate<Required<WithGenericKey<T, Key, Value>>>;
	type AllPossibilitiesOf<T extends Dispatchable, K extends ValidKeyOf<T>> = { [x in T[K]]: PredicateToInferredType<T, K, x> }

	export function dispatch<T extends Dispatchable, const K extends ValidKeyOf<T>>(key: K, possibilities: AllPossibilitiesOf<T, K>): Predicate<T> {
		return (t: T) => {
			if (t == undefined)
				return false;

			const actualType = t[key];

			if (actualType == undefined)
				return false;

			const possibility = possibilities[actualType];

			if (possibility == undefined)
				return true;

			return verify(t as Required<T>, possibility);
		}
	}

	export function fields<T extends object>(predicates: PredicateOnFields<T>): Predicate<T> {
		return (t: T) => {
			if (t == undefined)
				return false;

			for (const key in predicates) {
				const predicate = predicates[key];
				if (predicate != undefined && !verify(t[key], predicate))
					return false;
			}

			return true;
		}
	}

	export function not<T>(...predicates: CompositePredicate<T>[]): Predicate<T> {
		return (t: T) => !verify(t, predicates);
	}

	export function verify<T>(t: T, predicates: CompositePredicate<T>): boolean {
		if (typeof predicates == "function") {
			return predicates(t);
		} else {
			for (const predicate of predicates) {
				if (!verify(t, predicate))
					return false;
			}
			return true;
		}
	}

	export function toPredicate<T>(...composites: CompositePredicate<T>[]): Predicate<T> {
		return (t: T) => verify(t, composites);
	}
}
