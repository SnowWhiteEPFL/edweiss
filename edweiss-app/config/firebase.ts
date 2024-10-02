import auth from '@react-native-firebase/auth';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import storage from '@react-native-firebase/storage';

import { CallResult, FirebaseFunction } from '@/model/functions';
import { Deck } from '@/model/memento';
import { AppUser } from '@/model/users';

import {
	GoogleSignin,
	isErrorWithCode,
	isSuccessResponse,
	statusCodes
} from '@react-native-google-signin/google-signin';

export function signOut() {
	return auth().signOut();
}

export function signInAnonymously() {
	return auth().signInAnonymously();
}

export async function getDownloadURL(path: string) {
	return await storage().ref(path).getDownloadURL();
}

export async function callFunction<Args, Result, Errors>(func: FirebaseFunction<Args, Result, Errors>, args: Args) {
	const fn = getFunction(func.name);
	const data = await fn(args);
	return data.data as any as CallResult<Result, Error>;
}

export function getFunction(functionName: string) {
	return functions().httpsCallable(functionName);
}

export function getFileReference(path: string) {
	return storage().ref(path);
}

export interface DocumentData { [x: string]: any }
export type Collection<Type extends DocumentData> = FirebaseFirestoreTypes.CollectionReference<Type>;
export type Query<Type extends DocumentData> = FirebaseFirestoreTypes.Query<Type>;

export function CollectionOf<Type extends DocumentData>(path: string): Collection<Type> {
	return firestore().collection<Type>(path) as Collection<Type>;
}

export function CollectionCast<Type extends DocumentData>(col: Collection<any>) {
	return col as Collection<Type>;
}

export const Collections = {
	deck: CollectionOf<Deck>("decks"),
	users: CollectionOf<AppUser>("users")
}

export async function getDocument<Type extends DocumentData>(collection: Collection<Type>, id: string) {
	const doc = await collection.doc(id).get();
	return DocumentOf<Type>(doc);
}

export function getDocumentRef<Type extends DocumentData>(collection: Collection<Type>, id: string) {
	return collection.doc(id);
}

export async function getDocuments<Type extends DocumentData>(query: Query<Type>) {
	const docs = await query.get();
	return docs.docs.map(DocumentOf<Type>);
}

export interface Document<Type> {
	id: string,
	data: Type
}

export function DocumentOf<Type extends DocumentData>(v: FirebaseFirestoreTypes.DocumentSnapshot<Type>): Document<Type> {
	return { id: v.id, data: v.data() as Type };
}

export const signInWithGoogle = async () => {
	try {
		await GoogleSignin.hasPlayServices();
		const response = await GoogleSignin.signIn();
		if (isSuccessResponse(response)) {
			return response;
		} else {
			return undefined;
		}
	} catch (error) {
		if (isErrorWithCode(error)) {
			switch (error.code) {
				case statusCodes.IN_PROGRESS:
					// operation (eg. sign in) already in progress
					break;
				case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
					// Android only, play services not available or outdated
					break;
				default:
				// some other error happened
			}
		} else {
			// an error that's not related to google sign in occurred
		}
	}
};
