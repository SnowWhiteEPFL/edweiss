import { useEffect, useState } from 'react';

export default function usePromise<T>(fn: () => Promise<T>, deps?: React.DependencyList): T | undefined {
	const [value, setValue] = useState<T | undefined>(undefined);

	useEffect(() => {
		fn().then(setValue);
	}, deps || []);

	return value;
}
