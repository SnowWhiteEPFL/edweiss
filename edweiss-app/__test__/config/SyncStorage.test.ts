import { SyncStorageSingleton } from '@/config/SyncStorage';

const SyncStorage = new SyncStorageSingleton();

type KeyValuePair = [string, string | null];

const Disk: KeyValuePair[] = [
	["key1", "value1"],
	["key2", "value2"],
	["key3", "value3"],
]

jest.mock('@react-native-async-storage/async-storage', () => ({
	setItem: jest.fn(),
	getItem: jest.fn(),
	removeItem: jest.fn(),
	getAllKeys: jest.fn(() => {
		return {
			then(onfulfilled: (keys: string[]) => void) {
				onfulfilled(Disk.map(pair => pair[0]));
			},
		}
	}),
	multiGet: jest.fn(() => {
		return {
			then(onfulfilled: (kvp: KeyValuePair[]) => void) {
				onfulfilled(Disk);
			},
		}
	})
}));

describe("SyncStorage", () => {
	it("should return nothing when init", () => {
		expect(SyncStorage.init()).toBeUndefined();
		SyncStorage.getAllKeys().forEach(key => {
			expect(key).toBeTruthy();
		})
	});

	it("should store all the values from disk to memory", () => {
		Disk.forEach(pair => {
			expect(SyncStorage.get(pair[0])).toBe(pair[1]);
		});
	});

	it("should give back the same value after setting it", () => {
		SyncStorage.set("key", "value");
		expect(SyncStorage.has("key")).toBeTruthy();
		expect(SyncStorage.get("key")).toBe("value");
		expect(SyncStorage.remove("key")).toBeUndefined();
		expect(SyncStorage.get("key")).toBeUndefined();
	});

	it("should give the default value if it is not present on disk (no write)", () => {
		expect(SyncStorage.getOrDefaultNoWrite(Disk[0][0], "new_value")).toBe(Disk[0][1]);
		expect(SyncStorage.getOrDefaultNoWrite("not_in_disk", "new_value")).toBe("new_value");
	});

	it("should give the default value if it is not present on disk", () => {
		expect(SyncStorage.getOrDefault("not_in_disk2", "new_value")).toBe("new_value");
		expect(SyncStorage.getOrDefault("not_in_disk2", "lost")).toBe("new_value");
	});
});
