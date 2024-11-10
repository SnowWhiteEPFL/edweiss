/**
 * @file time.ts
 * @description time helper to interface easily with from firebase Timestamp to a JS Date
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

	export function sameDay(d1: Date, d2: Date) {
		return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
	}

	export function isToday(date: Date): boolean {
		return sameDay(date, new Date());
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

	export function getCurrentTimeInMinutes() {
		const now = new Date();
		return now.getHours() * 60 + now.getMinutes();
	}


	export function getCurrentDay() {
		const now = new Date();
		return now.getDay();
	}

	export function formatTime(minutes: number) {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		if (hours > 23) {
			return "23:59";
		}

		return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
	}

}
