
import { ReactNode } from 'react';
import TActivityIndicator, { TActivityIndicatorProps } from './TActivityIndicator';

interface ForProps<T> {
	each: T[] | undefined,
	children: (item: T, index: number) => ReactNode,
	loader?: TActivityIndicatorProps,
	fallback?: ReactNode;
}

const For = <T,>(props: Readonly<ForProps<T>>) => {
	if (!props.each) {
		if (props.fallback)
			return props.fallback;
		return <TActivityIndicator size={40} {...props.loader} />;
	}

	return props.each.map(props.children);
};

export default For;
