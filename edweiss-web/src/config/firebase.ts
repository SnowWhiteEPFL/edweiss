// import 'dotenv/config';
// require('dotenv').config();

import ENV from "./.api_key.json";

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import { CallResult, FunctionSignature } from '@/model/functions';
import { NextOrObserver, User, getAuth, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import * as FS from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { GoogleAuthProvider } from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

// console.log("Hello");
// console.log(process);

const app = firebase.initializeApp({
	apiKey: ENV.FIREBASE_API_KEY,
	authDomain: "edweiss-dev.firebaseapp.com",
	projectId: "edweiss-dev",
	storageBucket: "edweiss-dev.appspot.com",
	messagingSenderId: "116487680399",
	appId: "1:116487680399:web:17b8178c171d507a311bfa"
});

const auth = getAuth(app);
const db = FS.getFirestore(app);
// const storage = getStorage(app);
const functions = getFunctions(app);

export function listenForAuthStateChange(callback: NextOrObserver<User>) {
	return onAuthStateChanged(auth, callback);
}

function getFunction(functionName: string) {
	return httpsCallable(functions, functionName);
}

export async function callFunction<Args, Result, Error>(func: FunctionSignature<Args, Result, Error>, args: Args) {
	const fn = getFunction(func.exportedName);
	const data = await fn(args);
	return data.data as any as CallResult<Result, Error>;
}

export interface Document<Type> {
	id: string,
	data: Type;
}

export interface DocumentData { [x: string]: any; }

export type Collection<Type> = FS.CollectionReference<FS.DocumentData, FS.DocumentData>;

export function DocumentOf<Type>(v: FS.DocumentSnapshot<FS.DocumentData, FS.DocumentData>) {
	return { id: v.id, data: v.data() as Type };
}

export function CollectionOf<Type>(collectionPath: string): Collection<Type> {
	return FS.collection(db, collectionPath) as Collection<Type>;
}

// @ts-ignore
export interface TypedConstraint<Type> extends FS.QueryConstraint { }

// @ts-ignore
export interface TypedQuery<Type> extends FS.Query<FS.DocumentData, FS.DocumentData> { }

export function query<Type>(collection: Collection<Type>, ...queryConstraints: TypedConstraint<Type>[]): TypedQuery<Type> { return FS.query(collection, ...queryConstraints); }

export function where<Type>(key: keyof Type, opStr: FS.WhereFilterOp, value: unknown): TypedConstraint<Type> { return FS.where(key as string, opStr, value); }

export function orderBy<Type>(key: keyof Type, directionStr?: FS.OrderByDirection | undefined): TypedConstraint<Type> { return FS.orderBy(key as string, directionStr); }

export function limit<Type>(limit: number): TypedConstraint<Type> { return FS.limit(limit); }

export function limitToLast<Type>(limit: number): TypedConstraint<Type> { return FS.limitToLast(limit); }

export async function getDocument<Type>(collection: Collection<Type>, id: string) {
	const fetchedDocument = await FS.getDoc(FS.doc(collection, id));
	return DocumentOf<Type>(fetchedDocument);
}

export function getDocumentRef<Type>(collection: Collection<Type>, id: string) {
	return FS.doc(collection, id);
}

export async function getDocuments<Type>(query: TypedQuery<Type>) {
	const docsRef = await FS.getDocs(query);
	return docsRef.docs.map(DocumentOf<Type>);
}

export function googleSignIn() {
	signInWithPopup(auth, googleProvider)
		.then((result) => {
			const credential = GoogleAuthProvider.credentialFromResult(result);
			if (credential == null)
				return;

			console.log("Google sign in success ! " + JSON.stringify(result.user));
		}).catch((error) => {
			console.log("Google sign in failure " + JSON.stringify(error));
		});
}

