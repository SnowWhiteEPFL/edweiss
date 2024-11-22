import { Href, router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';

/**
 * The application route type signature alongside its path.
 * 
 * Use with {@link useRouteParameters} and {@link pushWithParameters}.
 */
export interface ApplicationRouteSignature<T> {
	path: Href<string>
}

/**
 * Parses the route parameters with {@link ApplicationRouteSignature} to deduce the type of the parameters.
 * 
 * Use {@link pushWithParameters} to push the right arguments.
 * 
 * @returns The parsed parameters.
 */
export function useRouteParameters<T>(_: ApplicationRouteSignature<T>): T {
	const { params } = useLocalSearchParams();

	const parsed = useMemo(() => JSON.parse(params as string) as T, []);

	return parsed;
}

/**
 * Pushes type-safe arguments to the given route.
 * 
 * @param signature The pushed route. It also gives type-safe constraints to the arguments.
 * @param params Arguments to push
 */
export function pushWithParameters<T>(signature: ApplicationRouteSignature<T>, params: T) {
	router.push({
		pathname: signature.path as any,
		params: {
			params: JSON.stringify(params)
		}
	});
}

/**
 * @returns `useLocalSearchParams()` but only with string parameters returned.
 */
export function useStringParameters(): { [x in string]: string } {
	return useLocalSearchParams();
}
