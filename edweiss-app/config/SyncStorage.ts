import AsyncStorage from '@react-native-async-storage/async-storage';

function isTemporary(key: string) {
	return key.startsWith('temp');
}

/**
 * Do not instantiate this class, it is a singleton.
 * Use the already defined below `SyncStorage` object.
 */
export class SyncStorageSingleton {
	data: Map<string, any> = new Map();
	loading: boolean = true;
	// listeners: Map<string, (data: unknown) => void> = new Map();
	listeners: { key: string, callback: (data: any) => void }[] = [];

	init() {
		if (this.loading == false)
			return;

		AsyncStorage.getAllKeys().then(keys => {
			AsyncStorage.multiGet(keys).then((data) => {
				data.forEach((d => {
					if (d[1] != null)
						this.saveItem([d[0], d[1]]);
				}));

				this.loading = false;
			});
		});
	}

	addListener<T>(key: string, callback: (data: T | undefined) => void): () => void {
		const listener = {
			key,
			callback
		};

		this.listeners.push(listener);
		return () => this.removeListener(listener);
	}

	removeListener<T>(listener: { key: string, callback: (data: T) => void }) {
		this.listeners = this.listeners.filter(l => l != listener);
	}

	get(key: string): any {
		return this.data.get(key);
	}

	getOrDefault<Type>(key: string, defaultValue: Type): Type {
		if (!this.data.has(key)) {
			if (!isTemporary(key))
				this.set(key, defaultValue);
			return defaultValue;
		}

		return this.data.get(key);
	}

	getOrDefaultNoWrite<Type>(key: string, defaultValue: Type): Type {
		if (!this.data.has(key)) {
			return defaultValue;
		}

		return this.data.get(key);
	}

	set(key: string, value: any) {
		if (value == undefined || value == null)
			return this.remove(key);

		this.data.set(key, value);
		this.triggerListeners(key, value);

		if (isTemporary(key))
			return;

		AsyncStorage.setItem(key, JSON.stringify(value));
	}

	remove(key: string) {
		this.data.delete(key);
		this.triggerListeners(key, undefined);

		if (isTemporary(key))
			return;

		AsyncStorage.removeItem(key);
	}

	has(key: string) {
		return this.data.has(key);
	}

	saveItem(item: [string, string]) {
		let value;

		try {
			value = JSON.parse(item[1]);
		} catch (e) {
			[, value] = item;
		}

		this.data.set(item[0], value);
	}

	triggerListeners(key: string, data: any) {
		this.listeners.filter(l => l.key === key).forEach(l => l.callback(data))
	}

	getAllKeys(): string[] {
		return Array.from(this.data.keys());
	}
}

const SyncStorage = new SyncStorageSingleton();

SyncStorage.init();

export function setStorageItem(key: string, value: any) {
	return SyncStorage.set(key, value);
}

export function getStorageItem<Type>(key: string, defaultValue: Type) {
	if (!SyncStorage.has(key))
		return defaultValue;
	return SyncStorage.get(key);
}

export function getStorageItemOrWrite<Type>(key: string, defaultValue: Type) {
	return SyncStorage.getOrDefault(key, defaultValue);
}

export default SyncStorage;