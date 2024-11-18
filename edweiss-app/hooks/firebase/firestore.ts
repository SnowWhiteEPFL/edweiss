import { Collection, Collections, Document, DocumentData, DocumentOf, Query, callFunction, getDocument, getDocuments } from '@/config/firebase';
import Memento from '@/model/memento';
import { doc, onSnapshot } from '@react-native-firebase/firestore';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

export interface RepositoryHandler<T extends DocumentData> {
	deleteDocument: (id: string) => void,
	changeDocument: (id: string, newData: Partial<T>) => void,
	addDocument: (t: T) => void
}

// export type RepositoryActions<T extends DocumentData> = {
// 	[x in string]: RepositoryAction<T>
// }

// type RepositoryAction<T extends DocumentData> = (handler: RepositoryHandler<T>, ...args: any[]) => void;

export interface RepositoryDocument<Type> extends Document<Type> {
	synced: boolean
}

export function useRepository<Type extends DocumentData>(query: Query<Type>, deps?: React.DependencyList): [Document<Type>[] | undefined, RepositoryHandler<Type>] {
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
	}, deps || []);

	const handler: RepositoryHandler<Type> = useMemo(() => ({
		addDocument(data) {
			setDocuments(documents => {
				const toAdd: RepositoryDocument<Type> = {
					id: generateUID(8),
					data,
					synced: false
				};

				if (documents == undefined) {
					return [toAdd];
				} else {
					return [...documents, toAdd];
				}
			});
		},
		changeDocument(id, newData) {

		},
		deleteDocument(id) {

		},
	}), deps || []);

	return [documents, handler];
}

function generateUID(len: number): string {
	return "";
}

const [documents, handler] = useRepository(Collections.deck);

const addDeck = async (deck: Memento.Deck) => {
	handler.addDocument(deck);
	const res = await callFunction(Memento.Functions.createDeck, { deck });
	if (res.status == 0) {

	}
}
