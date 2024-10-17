import { Timestamp as FBFirebase } from 'firebase-admin/firestore';
import { Timestamp } from 'model/time';

export namespace Time {
	export function now(): Timestamp {
		return FBFirebase.now();
	}

	export function fromDate(date: Date): Timestamp {
		return FBFirebase.fromDate(date);
	}
}