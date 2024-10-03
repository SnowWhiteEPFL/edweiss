import { Timestamp } from 'firebase-admin/firestore';

export namespace Time {
	export function now() {
		return Timestamp.now();
	}

	export function fromDate(date: Date) {
		return Timestamp.fromDate(date);
	}
}

