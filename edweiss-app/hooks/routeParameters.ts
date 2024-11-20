import { Href, router, useLocalSearchParams } from 'expo-router';

export interface ApplicationRouteParameters<T> {
	path: Href<string>
}

export function useStringParameters(): { [x in string]: string } {
	return useLocalSearchParams();
}

export function useRouteParameters<T>(_: ApplicationRouteParameters<T>): T {
	const { params } = useLocalSearchParams();
	return JSON.parse(params as string) as T;
}

export function pushWithParameters<T>(route: ApplicationRouteParameters<T>, params: T) {
	router.push({
		pathname: route.path as any,
		params: {
			params: JSON.stringify(params)
		}
	});
}
