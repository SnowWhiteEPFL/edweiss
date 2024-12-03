import { FailedCallResult } from 'model/functions';
import { INVALID_ARGUMENT, fail } from './status';

export type Predicate<T> = (t: T) => boolean;
export type CompositePredicate<T> = Predicate<T> | CompositePredicate<T>[];
export type PredicateOnFields<T> = { [x in keyof T]: CompositePredicate<T[x]> };

type AssertionError = FailedCallResult<string> | string;

const DEFAULT_ASSERTION_ERROR = INVALID_ARGUMENT;

function throwable(error: AssertionError): FailedCallResult<string> {
	return typeof error == "string" ? fail(error) : error;
}

function taggedThrowable(tag: AssertionError): FailedCallResult<string> {
	return typeof tag == "string" ? fail(`SANITIZATION_ERROR(${tag})`) : tag;
}

/**
 * Throws `error` if `condition` is false.
 * @param condition The condition that has to be true
 * @param error The error that is returned in case of failure.
 * 
 * @example assert(course != undefined, COURSE_NOT_FOUND)
 */
export function assert(condition: boolean, error: AssertionError = DEFAULT_ASSERTION_ERROR): asserts condition is true {
	if (!condition)
		throw throwable(error);
}

/**
 * Throws `error` if the `t` doesn't satisfy the `predicate`.
 * @param t The tested argument
 * @param predicate The predicate to satisfy
 * @param error The error that is returned in case of failure.
 * 
 * @example assertThat(13, Predicate.isPositive)
 */
export function assertThat<T>(t: T, predicate: CompositePredicate<T>, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assert(Predicate.verify(t, predicate), error);
}

/**
 * Throws `error` if any of the fields doesn't satisfy its predicate.
 * @param error The error that is returned in case of failure.
 */
export function assertThatFields<T extends object>(t: T, predicates: PredicateOnFields<T>, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(t, Predicate.isDefined);
	for (const key in predicates) {
		const predicate = predicates[key];

		if (predicate != undefined)
			assert(Predicate.verify(t[key], predicate), error);
	}
}

/**
 * Throws `error` if the argument isn't a number.
 * @param error The error that is returned in case of failure.
 */
export function assertNumber(number: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isNumber, error);
}

/**
 * Throws `error` if the argument isn't a string.
 * @param error The error that is returned in case of failure.
 */
export function assertString(string: string, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(string, Predicate.isString, error);
}

/**
 * Throws `error` if the argument isn't a boolean.
 * @param error The error that is returned in case of failure.
 */
export function assertBoolean(boolean: boolean, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(boolean, Predicate.isBoolean, error);
}

/**
 * Throws `error` if the argument isn't an object or an array (JS is weird).
 * @param error The error that is returned in case of failure.
 */
export function assertObject(object: object, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(object, Predicate.isObject, error);
}

/**
 * Throws `error` if the argument isn't an array.
 * @param error The error that is returned in case of failure.
 */
export function assertArray<T>(array: T[], error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(array, Predicate.isArray, error);
}

/**
 * Throws `error` if the argument isn't a positive number (`x >= 0`).
 * @param error The error that is returned in case of failure.
 */
export function assertPositiveNumber(number: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isPositive, error);
}

/**
 * Throws `error` if the argument isn't a strictly positive number (`x > 0`).
 * @param error The error that is returned in case of failure.
 */
export function assertStrictlyPositiveNumber(number: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isStrictlyPositive, error);
}

/**
 * Throws `error` if the argument isn't a between the given interval (`x >= min && x <= max`).
 * @param error The error that is returned in case of failure.
 */
export function assertIsBetween(number: number, min: number, max: number, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(number, Predicate.isBetween(min, max), error);
}

/**
 * Throws `error` if the argument is an empty string.
 * @param error The error that is returned in case of failure.
 */
export function assertNonEmptyString(string: string, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertThat(string, Predicate.isNonEmptyString, error);
}

/**
 * Throws `error` if the any of the arguments is an empty string.
 * @param error The error that is returned in case of failure.
 */
export function assertNonEmptyStrings(...strings: string[]) {
	assertThat(strings, Predicate.forEach(Predicate.isNonEmptyString));
}

/**
 * Throws `error` if the argument isn't in the given `list`.
 * @param error The error that is returned in case of failure.
 */
export function assertIsIn<const T>(t: T, list: T[], error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertArray(list, error);
	assertThat(t, Predicate.isIn(list), error);
}

/**
 * Throws `error` if any of the elements doesn't satisfy the predicate.
 * @param error The error that is returned in case of failure.
 */
export function assertForEach<const T>(list: T[], predicate: CompositePredicate<T>, error: AssertionError = DEFAULT_ASSERTION_ERROR) {
	assertArray(list, error);
	list.forEach(t => assert(Predicate.verify(t, predicate), error));
}

/**
 * Gives a "tagged" version of the given `predicate`, so that if the `predicate` isn't satisfied, it
 * throws an error with the `tag` name. (Very useful for debugging sanitization)
 * @returns The tagged `predicate`
 */
export function tag<T>(predicate: CompositePredicate<T>, tag: AssertionError): CompositePredicate<T> {
	return (t: T) => {
		try {
			const part = Predicate.verify(t, predicate);

			if (part == false)
				throw taggedThrowable(tag);

			return true;
		} catch (_: FailedCallResult<string> | any) {
			throw taggedThrowable(tag);
		}
	}
}

export namespace Predicate {

	/**
	 * @returns A predicate that returns `true` if `value` is passed in.
	 */
	export function is<const T>(value: T): Predicate<T> {
		return (t: T) => t === value;
	}

	/**
	 * @returns A predicate that returns `false` if `value` is passed in.
	 */
	export function isNot<T>(value: T): Predicate<T> {
		return (t: T) => t !== value;
	}

	/**
	 * @returns `true` if it's defined.
	 */
	export function isDefined<T>(t: T): boolean {
		return t != undefined;
	}

	/**
	 * @returns `true` if it's undefined.
	 */
	export function isUndefined<T>(t: T | undefined): boolean {
		return t == undefined;
	}

	/**
	 * @returns `true` if it's a number.
	 */
	export function isNumber(x: number): boolean {
		return typeof x == "number";
	}

	/**
	 * @returns `true` if it's a string.
	 */
	export function isString(x: string): boolean {
		return typeof x == "string";
	}

	/**
	 * @returns `true` if it's a boolean.
	 */
	export function isBoolean(x: boolean): boolean {
		return typeof x == "boolean";
	}

	/**
	 * @returns `true` if it's an object or array (arrays are object in JS).
	 */
	export function isObject(x: object): boolean {
		return typeof x == "object";
	}

	/**
	 * @returns `true` if it's an array.
	 */
	export function isArray<T>(x: T[]): boolean {
		return Array.isArray(x);
	}

	/**
	 * @returns `true` if it's either a number or undefined.
	 */
	export function isOptionalNumber(x: number | undefined): boolean {
		return x == undefined || typeof x == "number";
	}

	/**
	 * @returns `true` if it's either a string or undefined.
	 */
	export function isOptionalString(x: string | undefined): boolean {
		return x == undefined || typeof x == "string";
	}

	/**
	 * @returns `true` if it's either a boolean or undefined.
	 */
	export function isOptionalBoolean(x: boolean | undefined): boolean {
		return x == undefined || typeof x == "boolean";
	}

	/**
	 * @returns `true` if it's either an object, an array or undefined.
	 */
	export function isOptionalObject(x: object | undefined): boolean {
		return x == undefined || typeof x == "object";
	}

	/**
	 * @returns `true` if it's either an array or undefined.
	 */
	export function isOptionalArray<T>(x: T[] | undefined): boolean {
		return x == undefined || Array.isArray(x);
	}

	/**
	 * @returns `true` if it's a number and it's positive (`x >= 0`).
	 */
	export function isPositive(x: number): boolean {
		return typeof x == "number" && x >= 0;
	}

	/**
	 * @returns `true` if it's a number and it's strictly positive (`x > 0`).
	 */
	export function isStrictlyPositive(x: number): boolean {
		return typeof x == "number" && x > 0;
	}

	/**
	 * @returns `true` if it's a number and it's negative (`x < 0`).
	 */
	export function isNegative(x: number): boolean {
		return typeof x == "number" && x < 0;
	}

	/**
	 * @returns `true` if it's a string and it's not empty (`length > 0`).
	 */
	export function isNonEmptyString(x: string): boolean {
		return typeof x == "string" && x.length > 0;
	};

	/**
	 * @returns `true` if it's a string and it's empty (`length == 0`).
	 */
	export function isBetweenLength(min: number, max: number): Predicate<string> {
		return (x: string) => typeof x == "string" && x.length >= min && x.length <= max;
	}

	/**
	 * @returns A predicate that returns `true` if the number is more than the `threshold` (`x > threshold`).
	 */
	export function isMore(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x > threshold;
	}

	/**
	 * @returns A predicate that returns `true` if the number is more or equal than the `threshold` (`x >= threshold`).
	 */
	export function isMoreOrEqual(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x >= threshold;
	}

	/**
	 * @returns A predicate that returns `true` if the number is less than the `threshold` (`x < threshold`).
	 */
	export function isLess(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x < threshold;
	}

	/**
	 * @returns A predicate that returns `true` if the number is less or equal than the `threshold` (`x <= threshold`).
	 */
	export function isLessOrEqual(threshold: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x <= threshold;
	}

	/**
	 * @returns A predicate that returns `true` if the number is between the `min` and `max` (`x >= min && x <= max`).
	 */
	export function isBetween(min: number, max: number): Predicate<number> {
		return (x: number) => typeof x == "number" && x >= min && x <= max;
	}

	/**
	 * @returns `true` if all elements of the list satisfy `predicate`.
	 */
	export function forEach<T>(...predicate: CompositePredicate<T>[]): Predicate<T[]> {
		return (ts: T[]) => {
			if (ts == undefined || !Array.isArray(ts))
				return false;

			for (const t of ts) {
				if (!verify(t, predicate))
					return false;
			}

			return true;
		}
	}

	/**
	 * @returns `true` if it's an array and it's not empty (`length > 0`).
	 */
	export function isNonEmptyArray<T>(ts: T[]): boolean {
		return Array.isArray(ts) && ts.length > 0;
	}

	/**
	 * @returns A predicate that returns `true` if the element is inside `list`.
	 */
	export function isIn<T>(list: T[]): Predicate<T> {
		return (t: T) => list.includes(t);
	}

	/**
	 * @returns A predicate that returns `false` if the element is inside `list`.
	 */
	export function isNotIn<T>(list: T[]): Predicate<T> {
		return (t: T) => !list.includes(t);
	}

	/**
	 * @returns `true` if any of the `possibilities` (predicates) are satisfied.
	 */
	export function isEither<T>(...possibilities: CompositePredicate<T>[]) {
		return (t: T) => {
			for (const predicate of possibilities) {
				if (verify(t, predicate))
					return true;
			}

			return false;
		}
	}

	/**
	 * @returns `true` if it's undefined or satisfy the `predicates`.
	 */
	export function isOptional<T>(...predicates: CompositePredicate<T>[]): Predicate<T | undefined> {
		return (t: T | undefined) => t == undefined || verify(t, predicates);
	}

	/**
	 * @returns `true` if it's defined and its `key` satisfy the `predicates`.
	 */
	export function field<T, const K extends keyof T>(key: K, ...predicates: CompositePredicate<T[K]>[]): Predicate<T> {
		return (t: T) => t != undefined && verify(t[key], predicates);
	}

	/**
	 * Evil type shenanigans, this was Pain.
	 * Don't try to understand all that, it's only to make Intellisense behave a little.
	 */
	type ValidKeyOf<T> = Extract<keyof T, string>;
	type Dispatchable = Record<string, any>;
	type WithGenericKey<T, K extends string, V> = T & { [key in K]: V };
	type PredicateToInferredType<T extends Dispatchable, Key extends ValidKeyOf<T>, Value> = CompositePredicate<Required<WithGenericKey<T, Key, Value>>>;
	type AllPossibilitiesOf<T extends Dispatchable, K extends ValidKeyOf<T>> = { [x in T[K]]: PredicateToInferredType<T, K, x> }

	/**
	 * This predicate does a case disjunction based on `key`.
	 * @param possibilities all the possibilities of `key` and their associated predicates.
	 * @returns `true` if the actual case satisfy its predicates.
	 */
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

	/**
	 * @returns `true` if all the keys satisfy their predicates.
	 */
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

	/**
	 * @returns The `not` version of the `predicates` (boolean not).
	 */
	export function not<T>(...predicates: CompositePredicate<T>[]): Predicate<T> {
		return (t: T) => !verify(t, predicates);
	}

	/**
	 * For internal use only.
	 * @returns `true` if `t` satisfies the `predicates`.
	 */
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

	/**
	 * For internal use only.
	 * @returns A simple predicate function from a possible array of predicates.
	 */
	export function toPredicate<T>(...composites: CompositePredicate<T>[]): Predicate<T> {
		return (t: T) => verify(t, composites);
	}
}
