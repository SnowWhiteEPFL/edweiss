
import React, { ReactNode } from 'react';
import { TActivityIndicator } from './TActivityIndicator';

export default function For<T>(props: { each: T[] | undefined, children: (t: T) => ReactNode }) {
	if (!props.each)
		return <TActivityIndicator size={40} />

	return props.each.map(props.children);
}
