import { Collection, Document, DocumentData, DocumentOf, Query, getDocument, getDocuments } from '@/config/firebase';
import { doc, onSnapshot } from '@react-native-firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { useStoredState } from '../storage';

export function useDoc<Type extends DocumentData>(collection: Collection<Type>, id: string): Document<Type> | undefined {
	const [document, setDocument] = useState<Document<Type>>();

	useEffect(() => {
		(async () => {
			const fetchedDocument = await getDocument(collection, id);
			setDocument(fetchedDocument);
		})();
	}, [id]);

	return document;
}

export function usePrefetchedDynamicDoc<Type extends DocumentData>(collection: Collection<Type>, id: string, prefetched: Document<Type> | undefined): [Document<Type> | undefined, boolean] {
	const [document, setDocument] = useState<Document<Type> | undefined>(prefetched);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onSnapshot(doc(collection, id), (doc) => {
			setDocument(DocumentOf<Type>(doc));
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	return [document, loading] as const;
}

export function useRefreshableDoc<Type extends DocumentData>(collection: Collection<Type>, id: string): [Document<Type> | undefined, () => void] {
	const [document, setDocument] = useState<Document<Type>>();

	const refresh = useCallback(() => {
		(async () => {
			const fetchedDocument = await getDocument(collection, id);
			setDocument(fetchedDocument);
		})();
	}, []);

	useEffect(refresh, []);

	return [document, refresh] as const;
}

export function useDocs<Type extends DocumentData>(query: Query<Type>, deps?: React.DependencyList): Document<Type>[] | undefined {
	const [documents, setDocuments] = useState<Document<Type>[]>();

	useEffect(() => {
		(async () => {
			const fetchedDocuments = await getDocuments(query);
			setDocuments(fetchedDocuments);
		})();
	}, deps || []);

	return documents;
}

export function useRefreshableDocs<Type extends DocumentData>(query: Query<Type>): [Document<Type>[] | undefined, () => void] {
	const [documents, setDocuments] = useState<Document<Type>[]>();

	const refresh = useCallback(() => {
		(async () => {
			const fetchedDocuments = await getDocuments(query);
			setDocuments(fetchedDocuments);
		})();
	}, []);

	useEffect(refresh, []);

	return [documents, refresh] as const;
}

export function useDynamicDocs<Type extends DocumentData>(query: Query<Type>) {
	const [documents, setDocuments] = useState<Document<Type>[]>();

	useEffect(() => {
		getDocuments(query).then(docs => setDocuments(docs));

		let firstTime = true;
		const unsubscribe = query.onSnapshot(querySnapshot => {
			if (firstTime == true) {
				firstTime = false;
				return;
			}

			setDocuments(querySnapshot.docs.map(DocumentOf<Type>));
		}, error => {
			console.log(`Snapshot Error: ${error}`)
		})
		return unsubscribe
	}, [])

	return documents;
}

export function useDocsWithIds<Type extends DocumentData>(collection: Collection<Type>, ids: string[]) {
	const [documents, setDocuments] = useState<Document<Type>[]>()

	useEffect(() => {
		Promise.all(ids.map(id => getDocument(collection, id))).then(setDocuments);
	}, []);

	return documents
}

export function useCachedDoc<Type extends DocumentData>(key: string, collection: Collection<Type>, id: string) {
	const [document, setDocument] = useStoredState<Document<Type> | undefined>(`${key}@${id}`, undefined);

	useEffect(() => {
		(async () => {
			const fetchedDocument = await getDocument(collection, id);
			setDocument(fetchedDocument);
		})();
	}, [id]);

	return document;
}

export function useCachedDocs<Type extends DocumentData>(key: string, query: Query<Type>, deps?: React.DependencyList) {
	const [documents, setDocuments] = useStoredState<Document<Type>[] | undefined>(key, undefined);

	useEffect(() => {
		(async () => {
			const fetchedDocuments = await getDocuments(query);
			setDocuments(fetchedDocuments);
		})();
	}, deps || []);

	return documents;
}

// type SyncCallback = (id: string) => void;

// export interface RepositoryHandler<T extends DocumentData> {
// 	readonly addDocument: (data: T, idSupplier: Promise<CallResult<{ id: string }, unknown>> | undefined) => void,
// 	readonly modifyDocument: (id: string, data: Partial<T>, syncCallback: SyncCallback | undefined) => void,
// 	readonly deleteDocument: (id: string, syncCallback: SyncCallback | undefined) => void
// }

// export interface RepositoryDocument<Type> extends Document<Type> {
// 	syncedId: boolean
// }

// export interface YetToSyncEvent {
// 	fakeId: string,
// 	callback: SyncCallback
// }

// const FakeIdLength = 16;

// type RepositoryKey = string;

// export function useRepository<Type extends DocumentData>(repositoryKey: RepositoryKey, query: Query<Type>): [RepositoryDocument<Type>[] | undefined, RepositoryHandler<Type>] {
// 	const [documents, setDocuments, refreshRepository] = useStoredState<RepositoryDocument<Type>[] | undefined>(`repo:${repositoryKey}`, undefined);
// 	const yetToSyncEvents = useRef<YetToSyncEvent[]>([]);

// 	useEffect(() => {
// 		(async () => {
// 			const fetchedDocuments = await getDocuments(query);
// 			setDocuments(fetchedDocuments.map(doc => ({ ...doc, syncedId: true })));
// 		})();

// 		const unsubscribe = SyncStorage.addListener<RepositoryDocument<Type>[] | undefined>(`repo:${repositoryKey}`, (value) => {
// 			value?.forEach(doc => {
// 				if (doc.syncedId) {
// 					yetToSyncEvents.current.filter(event => event.fakeId == doc.id).forEach(event => event.callback(doc.id));
// 					yetToSyncEvents.current = yetToSyncEvents.current.filter(event => event.fakeId != doc.id);
// 				}
// 			})
// 			refreshRepository();
// 		});
// 		return unsubscribe;
// 	}, []);

// 	const addDocument = useCallback((data: Type, idSupplier: Promise<CallResult<{ id: string }, unknown>> | undefined) => {
// 		const fakeId = generateUID(FakeIdLength);

// 		setDocuments(documents => {
// 			const toAdd: RepositoryDocument<Type> = {
// 				id: fakeId,
// 				data,
// 				syncedId: false
// 			};

// 			return documents ? [...documents, toAdd] : [toAdd];
// 		});

// 		if (idSupplier) {
// 			idSupplier.then(res => {
// 				if (res.status == 1) {
// 					setDocuments(documents => {
// 						const newDocuments = documents ? [...documents] : [];
// 						const doc = newDocuments.find(doc => doc.id == fakeId);

// 						if (doc) {
// 							doc.id = res.data.id;
// 							doc.syncedId = true;
// 						} else {
// 							newDocuments.push({
// 								id: res.data.id,
// 								data,
// 								syncedId: true
// 							});
// 						}

// 						yetToSyncEvents.current.filter(event => event.fakeId == fakeId).forEach(event => {
// 							event.callback(res.data.id);
// 						});
// 						yetToSyncEvents.current = yetToSyncEvents.current.filter(event => event.fakeId != fakeId);

// 						return newDocuments;
// 					});
// 				} else {
// 					deleteDocument(fakeId, undefined);
// 				}
// 			});
// 		}
// 	}, []);

// 	const modifyDocument = useCallback((id: string, newData: Partial<Type>, syncCallback: SyncCallback | undefined) => {
// 		setDocuments(documents => {
// 			if (documents) {
// 				const newDocuments = [...documents];
// 				const doc = newDocuments.find(doc => doc.id == id);
// 				if (doc) {
// 					doc.data = { ...doc.data, newData };
// 					if (syncCallback) {
// 						if (doc.syncedId) {
// 							syncCallback(doc.id);
// 						} else {
// 							yetToSyncEvents.current.push({
// 								fakeId: doc.id,
// 								callback: syncCallback
// 							});
// 						}
// 					}
// 				}
// 				return newDocuments;
// 			}
// 		});

// 	}, []);

// 	const deleteDocument = useCallback((id: string, syncCallback: SyncCallback | undefined) => {
// 		setDocuments(documents => {
// 			if (documents) {
// 				const newDocuments = [...documents];
// 				const doc = newDocuments.find(doc => doc.id == id);

// 				if (doc) {
// 					newDocuments.splice(newDocuments.indexOf(doc), 1);

// 					if (syncCallback) {
// 						if (doc.syncedId) {
// 							syncCallback(doc.id);
// 						} else {
// 							yetToSyncEvents.current.push({
// 								fakeId: doc.id,
// 								callback: syncCallback
// 							});
// 						}
// 					}
// 				}

// 				return newDocuments;
// 			}
// 		});
// 	}, []);

// 	const handler: RepositoryHandler<Type> = useMemo(() => ({
// 		addDocument,
// 		modifyDocument,
// 		deleteDocument
// 	}), []);

// 	return [documents, handler] as const;
// }

// export interface RepositoryDocumentHandler<T extends DocumentData> {
// 	readonly modify: (id: string, data: Partial<T>, syncCallback: SyncCallback | undefined) => void,
// 	readonly delete: (id: string, syncCallback: SyncCallback | undefined) => void
// }

// export function useRepositoryDocument<Type extends DocumentData>(repositoryKey: RepositoryKey, collection: Collection<Type>, id: string): [RepositoryDocument<Type> | undefined, RepositoryDocumentHandler<Type>] {
// 	const [repository, setRepository, refreshRepository] = useStoredState<RepositoryDocument<Type>[] | undefined>(`repo:${repositoryKey}`, undefined);
// 	// const yetToSyncEvents = useRef<YetToSyncEvent[]>([]);

// 	const document = useMemo(() => {
// 		return repository?.find(repo => repo.id == id);
// 	}, [repository]);

// 	useEffect(() => {
// 		if (repository == undefined)
// 			console.log("You might have got the `repositoryKey` wrong. Check it again.");

// 		const unsubscribe = SyncStorage.addListener<RepositoryDocument<Type>[] | undefined>(`repo:${repositoryKey}`, (value) => {
// 			// value?.forEach(doc => {
// 			// 	if (doc.syncedId) {
// 			// 		yetToSyncEvents.current.filter(event => event.fakeId == doc.id).forEach(event => event.callback(doc.id));
// 			// 		yetToSyncEvents.current = yetToSyncEvents.current.filter(event => event.fakeId != doc.id);
// 			// 	}
// 			// })
// 			if (value && repository != value) {
// 				setRepository(repository);
// 			}
// 			// refreshRepository();
// 		});
// 		return unsubscribe;
// 	}, []);

// 	const handler: RepositoryDocumentHandler<Type> = useMemo(() => ({
// 		modify(id, newData, syncCallback) {
// 			setRepository(documents => {
// 				if (documents) {
// 					const newDocuments = [...documents];
// 					const doc = newDocuments.find(doc => doc.id == id);
// 					if (doc) {
// 						doc.data = { ...doc.data, newData };
// 						if (syncCallback) {
// 							if (doc.syncedId) {
// 								syncCallback(doc.id);
// 							} else {
// 								SyncStorage.pushOneTapListener<RepositoryDocument<Type>[] | undefined>(`repo:${repositoryKey}`, (value) => {
// 									if (!value)
// 										return;

// 									// if (value.find(v => v.))
// 								});
// 								// yetToSyncEvents.current.push({
// 								// 	fakeId: doc.id,
// 								// 	callback: syncCallback
// 								// });
// 							}
// 						}
// 					}
// 					return newDocuments;
// 				}
// 			});
// 		},
// 		delete(id, syncCallback) {
// 			setRepository(documents => {
// 				if (documents) {
// 					const newDocuments = [...documents];
// 					const doc = newDocuments.find(doc => doc.id == id);

// 					if (doc) {
// 						newDocuments.splice(newDocuments.indexOf(doc), 1);

// 						if (syncCallback) {
// 							if (doc.syncedId) {
// 								syncCallback(doc.id);
// 							} else {
// 								// yetToSyncEvents.current.push({
// 								// 	fakeId: doc.id,
// 								// 	callback: syncCallback
// 								// });
// 							}
// 						}
// 					}

// 					return newDocuments;
// 				}
// 			});
// 		},
// 	}), []);

// 	return [document, handler] as const;
// }

// function pushOneTapListener<Type>(repositoryKey: RepositoryKey, fakeId: string, callback: (id: string) => void) {
// 	SyncStorage.pushOneTapListener<RepositoryDocument<Type>[] | undefined>(`repo:${repositoryKey}`, (value) => {
// 		if (!value)
// 			return;

// 	});
// }
