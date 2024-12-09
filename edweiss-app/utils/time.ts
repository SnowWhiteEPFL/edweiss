/**
 * @file time.ts
 * @description time helper to interface easily with from firebase Timestamp to a JS Date
 * @author Adamm Alaoui & Youssef Laraki & Florian Dinant
 */

// ------------------------------------------------------------
// --------------- Import Modules & Components ----------------
// ------------------------------------------------------------

import t from '@/config/i18config';
import { timeInMS } from '@/constants/Time';
import { Timestamp } from '@/model/time';

// ------------------------------------------------------------
// ---------------   App's Time Utils Functions   -------------
// ------------------------------------------------------------

export namespace Time {

	export function toDate(timestamp: Timestamp): Date {
		const seconds: number = (timestamp as any).seconds;
		const _seconds: number = (timestamp as any)._seconds;
		const millis = (seconds ?? _seconds) * 1000;
		return new Date(millis);
	}

	// Fonction utilitaire pour créer un Timestamp à partir d'une Date
	export function fromDate(date: Date): Timestamp {
		const seconds = Math.floor(date.getTime() / 1000);
		const nanoseconds = (date.getTime() % 1000) * 1_000_000;
		return { seconds, nanoseconds };
	}

	export function isBeforeNow(timestamp: Timestamp): boolean {
		return timestamp.seconds * timeInMS.SECOND <= new Date().getTime()
	}

	export function isAfterNow(timestamp: Timestamp): boolean {
		return timestamp.seconds * timeInMS.SECOND > new Date().getTime()
	}

	export function sameDay(d1: Date, d2: Date): boolean {
		return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
	}

	export function sameMonth(d1: Date, d2: Date): boolean {
		return d1.getMonth() === d2.getMonth() && d1.getFullYear() === d2.getFullYear();
	}

	export function sameYear(d1: Date, d2: Date): boolean {
		return d1.getFullYear() === d2.getFullYear();
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

	export function getCurrentTimeInMinutes(): number {
		const now = new Date();
		return now.getHours() * 60 + now.getMinutes();
	}

	export function getCurrentDay(): number {
		const now = new Date();
		return now.getDay();
	}

	export function dateFromSeconds(seconds: number): Date {
		return new Date(seconds * 1000);
	}

	export function TimeFromSeconds(seconds: number): Timestamp {
		return { seconds: seconds, nanoseconds: 0 } as Timestamp;
	}

	export function formatTime(minutes: number) {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;

		if (hours > 23) {
			return "23:59";
		}

		return `${hours}:${mins < 10 ? '0' : ''}${mins}`;
	}

	export function timeSinceDisplay(date: Date) {
		var seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

		var interval = seconds / 31536000;

		if (interval >= 1) {
			const f = Math.floor(interval);
			return f + ` ${t(`common:time-since-display.year${f == 1 ? "" : "s"}`)}`;
		}
		interval = seconds / 2592000;
		if (interval >= 1) {
			const f = Math.floor(interval);
			return f + ` ${t(`common:time-since-display.month${f == 1 ? "" : "s"}`)}`;
		}
		interval = seconds / 86400;
		if (interval >= 1) {
			const f = Math.floor(interval);
			return f + ` ${t(`common:time-since-display.day${f == 1 ? "" : "s"}`)}`;
		}
		interval = seconds / 3600;
		if (interval >= 1) {
			const f = Math.floor(interval);
			return f + ` ${t(`common:time-since-display.hour${f == 1 ? "" : "s"}`)}`;
		}
		interval = seconds / 60;
		if (interval >= 1) {
			const f = Math.floor(interval);
			return f + ` ${t(`common:time-since-display.minute${f == 1 ? "" : "s"}`)}`;
		}

		const f = Math.floor(interval);
		return Math.floor(seconds) + " " + t(`common:time-since-display.second${f == 1 ? "" : "s"}`);
	}

	export function ago(date: Date) {
		return t("common:time-since-display.ago", { time: Time.timeSinceDisplay(date) })
	}

	export function agoTimestamp(ts: Timestamp) {
		return ago(toDate(ts));
	}

}
