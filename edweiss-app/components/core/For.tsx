
import React, { ReactNode } from 'react';
import { TActivityIndicator, TActivityIndicatorProps } from './TActivityIndicator';

export default function For<T>(props: { each: T[] | undefined, children: (item: T, index: number) => ReactNode, loader?: TActivityIndicatorProps, fallback?: ReactNode }) {
	if (!props.each) {
		if (props.fallback)
			return props.fallback;
		return <TActivityIndicator size={40} {...props.loader} />
	}

	return props.each.map(props.children);
}
