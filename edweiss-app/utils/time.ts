/**
 * @file updateTodo.ts
 * @description Cloud function for updating a todo item in the edweiss app
 * @author Adamm Alaoui & Youssef Laraki
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import { Timestamp } from '@/model/time';
import { Timestamp as FBTimestamp } from '@react-native-firebase/firestore';


// ------------------------------------------------------------
// ---------------   App's Time Utils Functions   -------------
// ------------------------------------------------------------
export namespace Time {
	export function toDate(timestamp: Timestamp): Date {
		const seconds: number = (timestamp as any).seconds;
		const _seconds: number = (timestamp as any)._seconds;
		const millis = (seconds ?? _seconds) * 1000;
		return FBTimestamp.fromMillis(millis).toDate();
	}

	export function isToday(date: Date): boolean {
		const today = new Date(new Date().setHours(0, 0, 0, 0));
		const dateToCheck = new Date(new Date(date).setHours(0, 0, 0, 0));
		return today.toDateString() === dateToCheck.toDateString();
	}

	export function wasYesterday(date: Date): boolean {
		const yesterday = new Date(new Date().setHours(0, 0, 0, 0) - 86400000);
		const dateToCheck = new Date(new Date(date).setHours(0, 0, 0, 0));
		return yesterday.toDateString() === dateToCheck.toDateString();
	}

	export function isTomorrow(date: Date): boolean {
		const tomorrow = new Date(new Date().setHours(0, 0, 0, 0) + 86400000);
		const dateToCheck = new Date(new Date(date).setHours(0, 0, 0, 0));
		return tomorrow.toDateString() === dateToCheck.toDateString();
	}
}
