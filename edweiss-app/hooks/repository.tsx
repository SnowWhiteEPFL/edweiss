import { Document, DocumentData, Query, getDocuments } from '@/config/firebase';
import { CallResult } from '@/model/functions';
import generateUID from '@/utils/uid';
import { Stack } from 'expo-router';
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useStoredState } from './storage';

/**
 * Encapsulates everything that is necessary to use a repository.
 */
export interface Repository<T extends DocumentData> {
	/**
	 * Unique key that is used when writing locally.
	 */
	readonly key: string,

	/**
	 * React context that is used when propagating the repository.
	 */
	readonly context: React.Context<RepositoryInstance<T>>
}

export interface RepositoryDocument<Type> extends Document<Type> {
	/**
	 * `true` if the `id` field of this object is the Firebase one.
	 */
	syncedId: boolean,

	/**
	 * Temporary id used when adding a document.
	 */
	readonly fakeId?: string
}

type MonoSyncCallback = (id: string) => void;
type MultiSyncCallback = (id: string[]) => void;

/**
 * Used to manipulate and modify the local {@link Repository} and enforce synchronicity with the cloud.
 */
export interface RepositoryHandler<T extends DocumentData> {
	/**
	 * Adds a document to the local {@link Repository} then syncs it with the cloud using `idSupplier`.
	 * @param data The data of the document to be added optimistically.
	 * @param idSupplier Typically a `callFunction` with an `{ id: string }` as a success return value.
	 */
	readonly addDocument: (data: T, idSupplier: Promise<CallResult<{ id: string }, unknown>>) => void,

	/**
	 * Modifies the document in the local {@link Repository} then syncs it with the cloud using `syncCallback`.
	 * @param id The `id` of the document to modify.
	 * @param data The fields with values to modify.
	 * @param syncCallback The Firebase callback with the real `id` used to enforce synchonicity.
	 */
	readonly modifyDocument: (id: string, data: Partial<T>, syncCallback: MonoSyncCallback | undefined) => void,

	/**
	 * Removes the document in the local {@link Repository} then syncs it with the cloud using `syncCallback`.
	 * @param id The `id` of the document to remove.
	 * @param syncCallback The Firebase callback with the real `id` used to enforce synchonicity.
	 */
	readonly deleteDocument: (id: string, syncCallback: MonoSyncCallback | undefined) => void,

	/**
	 * Removes the documents in the local {@link Repository} then syncs it with the cloud using `syncCallback`.
	 * @param ids The `ids` of the documents to remove.
	 * @param syncCallback The Firebase callback with the real `ids` used to enforce synchonicity.
	 */
	readonly deleteDocuments: (ids: string[], syncCallback: MultiSyncCallback | undefined) => void,
}

type RepositoryInstance<Type extends DocumentData> = [RepositoryDocument<Type>[] | undefined, RepositoryHandler<Type>]

interface MonoYetToSyncEvent {
	type: "mono",
	fakeId: string,
	callback: MonoSyncCallback
}

interface MultiYetToSyncEvent {
	type: "multi",
	fakeIds: string[],
	callback: MultiSyncCallback
}

type YetToSyncEvent = MonoYetToSyncEvent | MultiYetToSyncEvent;

/**
 * Creates a {@link Repository} signature to use with {@link useInitialRepository} and {@link RepositoryLayout}. Check the guide.
 * @param key Unique key of the {@link Repository} used to store it locally.
 * @returns The {@link Repository} signature.
 */
export function createRepository<T extends DocumentData>(key: string): Repository<T> {
	const defaultFn = () => console.error("No repository found, did you use `RepositoryLayout`? Check the guide on GitHub.");

	return {
		key, context: React.createContext<RepositoryInstance<T>>([undefined, {
			addDocument: defaultFn,
			modifyDocument: defaultFn,
			deleteDocument: defaultFn,
			deleteDocuments: defaultFn,
		}])
	};
}

function collectTrueIds<T>(newDocuments: RepositoryDocument<T>[], fakeIds: string[]): string[] | undefined {
	const trueIds: string[] = [];

	for (let idIndex = 0; idIndex < fakeIds.length; idIndex++) {
		const id = fakeIds[idIndex];
		const doc = newDocuments.find(doc => doc.id == id || doc.fakeId == id);
		if (doc) {
			if (!doc.syncedId)
				return undefined;

			trueIds.push(doc.id);
		} else return undefined;
	}

	return trueIds;
}

const FakeIdLength = 16;

/**
 * Initializes the local documents and fetches them both in disk and in the cloud, alongside the {@link RepositoryHandler}.
 * @param repository The {@link Repository} where to store locally all the documents.
 * @param query The cloud collection/query from which to perform the initial fetch.
 * @returns `[documents, handler]`
 */
export function useInitialRepository<Type extends DocumentData>(repository: Repository<Type>, query: Query<Type>): RepositoryInstance<Type> {
	const [documents, setDocuments] = useStoredState<RepositoryDocument<Type>[] | undefined>(repository.key, undefined);
	const yetToSyncEvents = useRef<YetToSyncEvent[]>([]);

	useEffect(() => {
		const timeout = setTimeout(async () => {
			const fetchedDocuments = await getDocuments(query);
			setDocuments(fetchedDocuments.map(doc => ({ ...doc, syncedId: true })));
		}, documents == undefined ? 0 : 5000); // this is too take into account for quick back and fourth between screens

		return () => clearTimeout(timeout);
	}, []);

	const addDocument = useCallback((data: Type, idSupplier: Promise<CallResult<{ id: string }, unknown>>) => {
		const fakeId = generateUID(FakeIdLength);

		setDocuments(documents => {
			const toAdd: RepositoryDocument<Type> = {
				id: fakeId,
				fakeId,
				data,
				syncedId: false
			};

			return documents ? [...documents, toAdd] : [toAdd];
		});

		idSupplier.then(res => {
			if (res.status == 1) {
				setDocuments(documents => {
					const newDocuments = documents ? [...documents] : [];
					const doc = newDocuments.find(doc => doc.id == fakeId);

					if (doc) {
						doc.id = res.data.id;
						doc.syncedId = true;
					} else {
						newDocuments.push({
							id: res.data.id,
							data,
							syncedId: true
						});
					}

					let toRemove: YetToSyncEvent[] = [];

					for (let index = 0; index < yetToSyncEvents.current.length; index++) {
						const event = yetToSyncEvents.current[index];

						if (event.type == "mono") {
							if (event.fakeId == fakeId) {
								event.callback(res.data.id);
								toRemove.push(event);
							}
						} else if (event.type == "multi") {
							const trueIds = collectTrueIds(newDocuments, event.fakeIds);
							if (trueIds != undefined) {
								event.callback(trueIds);
								toRemove.push(event);
							}
						}
					}

					// yetToSyncEvents.current.filter(event => event.fakeId == fakeId).forEach(event => event.callback(res.data.id));

					yetToSyncEvents.current = yetToSyncEvents.current.filter(event => !toRemove.includes(event));

					return newDocuments;
				});
			} else {
				deleteDocument(fakeId, undefined);
			}
		});
	}, []);

	const modifyDocument = useCallback((id: string, newData: Partial<Type>, syncCallback: MonoSyncCallback | undefined) => {
		setDocuments(documents => {
			if (documents) {
				const newDocuments = [...documents];
				const doc = newDocuments.find(doc => doc.id == id || doc.fakeId == id);
				if (doc) {
					doc.data = { ...doc.data, ...newData };
					if (syncCallback) {
						if (doc.syncedId) {
							syncCallback(doc.id);
						} else {
							yetToSyncEvents.current.push({
								type: "mono",
								fakeId: doc.id,
								callback: syncCallback
							});
						}
					}
				}
				return newDocuments;
			}
		});

	}, []);

	const deleteDocument = useCallback((id: string, syncCallback: MonoSyncCallback | undefined) => {
		setDocuments(documents => {
			if (documents) {
				const newDocuments = [...documents];
				const doc = newDocuments.find(doc => doc.id == id || doc.fakeId == id);

				if (doc) {
					newDocuments.splice(newDocuments.indexOf(doc), 1);

					if (syncCallback) {
						if (doc.syncedId) {
							syncCallback(doc.id);
						} else {
							yetToSyncEvents.current.push({
								type: "mono",
								fakeId: doc.id,
								callback: syncCallback
							});
						}
					}
				}

				return newDocuments;
			}
		});
	}, []);

	const deleteDocuments = useCallback((ids: string[], syncCallback: ((ids: string[]) => void) | undefined) => {
		setDocuments(documents => {
			if (documents) {
				const newDocuments = [...documents];

				ids.forEach(id => {
					const doc = newDocuments.find(doc => doc.id == id || doc.fakeId == id);
					if (doc != undefined)
						newDocuments.splice(newDocuments.indexOf(doc), 1);
				});

				if (syncCallback) {
					const trueIds = collectTrueIds(documents, ids);
					// console.log(`True ids : ${trueIds}`);
					// console.log(`Ids: ${ids}`);
					// console.log(`Documents: ${JSON.stringify(documents.map(d => `${d.id} / ${d.fakeId}`))}`);
					if (trueIds) {
						syncCallback(trueIds);
					} else {
						yetToSyncEvents.current.push({
							type: "multi",
							fakeIds: ids,
							callback: syncCallback
						});
					}
				}

				return newDocuments;
			}
		});
	}, []);

	const handler: RepositoryHandler<Type> = useMemo(() => ({
		addDocument,
		modifyDocument,
		deleteDocument,
		deleteDocuments
	}), []);

	return [documents, handler] as const;
}

/**
 * Uses the given {@link Repository} context and retrieves the documents and {@link RepositoryHandler}.
 * @returns `[documents, handler]`
 */
export function useRepository<T extends DocumentData>({ context }: Repository<T>) {
	return useContext(context);
}

/**
 * Uses the given {@link Repository} context and retrieves the asked document and {@link RepositoryHandler}.
 * @param id The `id` of the document to fetch locally.
 * @returns `[documents, handler]`
 */
export function useRepositoryDocument<T extends DocumentData>(id: string, repository: Repository<T>) {
	const [documents, handler] = useRepository(repository);
	if (documents == undefined)
		return [undefined, handler] as const;
	return [documents.find(repo => repo.id == id || repo.fakeId == id), handler] as const;
}

/**
 * Used to propagate the repository inside the whole folder. To only use inside `_layout.tsx` files.
 * @param repository The signature {@link Repository} created with {@link createRepository}.
 * @param collection The Firebase collection for the initial fetch.
 */
export function RepositoryLayout<T extends DocumentData>(props: { repository: Repository<T>, collection: Query<T> }) {
	const instance = useInitialRepository(props.repository, props.collection);

	return (
		<RepositoryProvider repository={props.repository} instance={instance}>
			<Stack />
		</RepositoryProvider>
	)
}

/**
 * Used to propagate the repository to the children.
 * @param repository The signature `Repository` created with {@link createRepository}.
 * @param instance The instance of the repository created with {@link useInitialRepository}. 
 */
export function RepositoryProvider<T extends DocumentData>(props: { children?: ReactNode, repository: Repository<T>, instance: RepositoryInstance<T> }) {
	const Context = props.repository.context;

	return (
		<Context.Provider value={props.instance}>
			{props.children}
		</Context.Provider>
	)
}
