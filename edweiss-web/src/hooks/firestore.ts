import { Collection, Document, DocumentData, DocumentOf, getDocument } from '@/config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';

export function useDoc<Type extends DocumentData>(collection: Collection<Type>, id: string): Document<Type> | undefined {
	const [document, setDocument] = useState<Document<Type>>();

	useEffect(() => {
		(async () => {
			const fetchedDocument = await getDocument(collection, id);
			setDocument(fetchedDocument);
		})();
	}, []);

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
