
import admin = require('firebase-admin');

import { DocumentData, OrderByDirection, WhereFilterOp } from 'firebase-admin/firestore';
import { Course } from 'model/school/courses';
import { AppUser } from 'model/users';

export interface Document<Type> {
	data: Type,
	id: string;
}

export type Collection<Type extends DocumentData> = admin.firestore.CollectionReference<Type, admin.firestore.DocumentData>;

export type DocumentReference<Type> = admin.firestore.DocumentReference<Type, admin.firestore.DocumentData>;

type QueryConstraintType = 'where' | 'order-by' | 'limit';

export interface QueryConstraint<Type> {
	type: QueryConstraintType;
}

export interface TypedWhere<Type> extends QueryConstraint<Type> {
	key: keyof Type,
	opStr: WhereFilterOp,
	value: any;
}

export interface TypedOrderBy<Type> extends QueryConstraint<Type> {
	key: keyof Type,
	directionStr?: OrderByDirection;
}

export interface TypedLimit<Type> extends QueryConstraint<Type> {
	limit: number;
}

export function DocumentOf<Type>(doc: FirebaseFirestore.QueryDocumentSnapshot<Type, FirebaseFirestore.DocumentData>): Document<Type> {
	return { data: doc.data(), id: doc.id };
}

export function CollectionOf<Type extends DocumentData>(path: string): Collection<Type> {
	return admin.firestore().collection(path) as Collection<Type>;
}

export const Collections = {
	users: CollectionOf<AppUser>("users"),
	courses: CollectionOf<Course>("courses")
};

export function query<Type extends DocumentData>(collection: Collection<Type>, ...constraints: QueryConstraint<Type>[]) {
	let current = collection;

	for (let i = 0; i < constraints.length; i++) {
		const constraint = constraints[i];

		if (constraint.type == 'where') {
			const filter = constraint as TypedWhere<Type>;
			current = current.where(filter.key as string, filter.opStr, filter.value) as Collection<Type>;
			continue;
		}

		if (constraint.type == 'order-by') {
			const filter = constraint as TypedOrderBy<Type>;
			current = current.orderBy(filter.key as string, filter.directionStr) as Collection<Type>;
			continue;
		}

		if (constraint.type == 'limit') {
			const filter = constraint as TypedLimit<Type>;
			current = current.limit(filter.limit) as Collection<Type>;
			continue;
		}
	}

	return current;
}

export function where<Type extends DocumentData>(key: keyof Type, opStr: WhereFilterOp, value: any): TypedWhere<Type> {
	return { type: 'where', key, opStr, value };
}

export function orderBy<Type extends DocumentData>(key: keyof Type, directionStr: OrderByDirection): TypedOrderBy<Type> {
	return { type: 'order-by', key, directionStr };
}

export function limit<Type extends DocumentData>(limit: number): TypedLimit<Type> {
	return { type: 'limit', limit };
}

export async function addDocument<Type extends DocumentData>(collection: Collection<Type>, data: Type) {
	return await collection.add(data as any);
}

export async function getDocuments<Type extends DocumentData>(collection: Collection<Type>) {
	return await collection.get();
}

/**
 * 
 * @param collection The typed Collection reference
 * @param id The ID of the document
 * @returns A reference to the document in the collection
 */
export function getDocumentRef<Type extends DocumentData>(collection: Collection<Type>, id: string): DocumentReference<Type> {
	return collection.doc(id);
}

/**
 * 
 * @param collection The typed Collection reference
 * @param id The ID of the document
 * @returns Both the typed document data and a reference to the document
 */
export async function getDocumentAndRef<Type extends DocumentData>(collection: Collection<Type>, id: string): Promise<[Type, DocumentReference<Type>]> {
	const ref = collection.doc(id);
	const doc = (await ref.get()).data() as Type;
	return [doc, ref];
}

/**
 * 
 * @param collection The typed Collection reference
 * @param id The ID of the document
 * @returns The typed document data
 */
export async function getDocument<Type extends DocumentData>(collection: Collection<Type>, id: string) {
	if (id == undefined)
		return undefined;
	return (await getDocumentRef(collection, id).get()).data() as (Type | undefined);
}

/**
 * 
 * @param collection The typed Collection reference
 * @param id The ID of the document
 * @param errorCode The error
 * @returns The typed document data
 */
export async function getRequiredDocument<Type extends DocumentData>(collection: Collection<Type>, id: string, errorCode: { error: any; status: 0; }) {
	const doc = await getDocument(collection, id);
	if (!doc)
		throw errorCode;
	return doc;
}

/**
 * Cleans the document data before adding it to a collection
 * @param obj Object to clean 
 * @returns Cleaned version of the object
 */
export function clean<T extends DocumentData>(obj: T): T {
	Object.keys(obj).forEach(key => obj[key as keyof T] === undefined ? delete obj[key as keyof T] : {});
	return obj;