
export type WeekDay = number & {};

export type Minutes = number & {};

/**
 * To only use with the util/time functions, this is an opaque type.
 */
export interface Timestamp {
	readonly seconds: number;
	readonly nanoseconds: number;
}

// Fonction utilitaire pour créer un Timestamp à partir d'une Date
export function fromDate(date: Date): Timestamp {
	const seconds = Math.floor(date.getTime() / 1000);
	const nanoseconds = (date.getTime() % 1000) * 1_000_000;
	return { seconds, nanoseconds };
}