import SyncStorage from '@/config/SyncStorage';
import { useCallback, useEffect, useState } from 'react';

export function useStoredState<Type>(key: string, defaultValue: Type) {
	const [value, setValue] = useState<Type>(SyncStorage.getOrDefault(key, defaultValue));

	const refresh = useCallback(() => setValue(SyncStorage.get(key) as Type), []);

	useEffect(() => {
		SyncStorage.set(key, value);
	}, [value]);

	return [value, setValue, refresh] as const;
}
