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
			console.log(`Snapshot Error: ${error}`);
		});
		return unsubscribe;
	}, []);

	return documents;
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
