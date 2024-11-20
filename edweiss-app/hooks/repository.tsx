import { Document, DocumentData, Query, getDocuments } from '@/config/firebase';
import { CallResult } from '@/model/functions';
import generateUID from '@/utils/uid';
import { Stack } from 'expo-router';
import React, { ReactNode, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useStoredState } from './storage';

// export type Repository<Type> = Document<Type>[];

export interface RepositorySignature<T extends DocumentData> {
	readonly key: string,
	readonly context: React.Context<Repository<T>>
}

export interface RepositoryDocument<Type> extends Document<Type> {
	syncedId: boolean,
	readonly fakeId?: string
}

export interface RepositoryHandler<T extends DocumentData> {
	readonly addDocument: (data: T, idSupplier: Promise<CallResult<{ id: string }, unknown>>) => void,
	readonly modifyDocument: (id: string, data: Partial<T>, syncCallback: MonoSyncCallback | undefined) => void,
	readonly deleteDocument: (id: string, syncCallback: MonoSyncCallback | undefined) => void,
	readonly deleteDocuments: (ids: string[], syncCallback: ((ids: string[]) => void) | undefined) => void,
}

export type Repository<Type extends DocumentData> = [RepositoryDocument<Type>[] | undefined, RepositoryHandler<Type>]

type MonoSyncCallback = (id: string) => void;
type MultiSyncCallback = (id: string[]) => void;

export interface MonoYetToSyncEvent {
	type: "mono",
	fakeId: string,
	callback: MonoSyncCallback
}

export interface MultiYetToSyncEvent {
	type: "multi",
	fakeIds: string[],
	callback: MultiSyncCallback
}

export type YetToSyncEvent = MonoYetToSyncEvent | MultiYetToSyncEvent;

export function createRepository<T extends DocumentData>(key: string): RepositorySignature<T> {
	return {
		key, context: React.createContext<Repository<T>>([undefined, {
			addDocument: () => console.log("No repository found. Check the guide on GitHub."),
			modifyDocument: () => console.log("No repository found. Check the guide on GitHub."),
			deleteDocument: () => console.log("No repository found. Check the guide on GitHub."),
			deleteDocuments: () => console.log("No repository found. Check the guide on GitHub."),
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

export function useInitialRepository<Type extends DocumentData>(signature: RepositorySignature<Type>, query: Query<Type>): Repository<Type> {
	const [documents, setDocuments] = useStoredState<RepositoryDocument<Type>[] | undefined>(signature.key, undefined);
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

export function useRepository<T extends DocumentData>({ context }: RepositorySignature<T>) {
	return useContext(context);
}

export function useRepositoryDocument<T extends DocumentData>(id: string, signature: RepositorySignature<T>) {
	const [repository, handler] = useRepository(signature);
	if (repository == undefined)
		return [undefined, handler] as const;
	return [repository.find(repo => repo.id == id || repo.fakeId == id), handler] as const;
}

export function RepositoryLayout<T extends DocumentData>(props: { signature: RepositorySignature<T>, collection: Query<T> }) {
	const repository = useInitialRepository(props.signature, props.collection);
	const Context = props.signature.context;

	return (
		<Context.Provider value={repository}>
			<Stack />
		</Context.Provider>
	)
}

export function RepositoryProvider<T extends DocumentData>(props: { children?: ReactNode, signature: RepositorySignature<T>, repository: Repository<T> }) {
	const Context = props.signature.context;

	return (
		<Context.Provider value={props.repository}>
			{props.children}
		</Context.Provider>
	)
}
