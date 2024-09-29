
import { GeoPoint, Timestamp } from 'firebase-admin/firestore';

export type FBGeoPoint = GeoPoint;
export type FBTimestamp = Timestamp;

export function Now(): FBTimestamp {
	return Timestamp.now();
}

export function TimestampFromMillis(millis: number): FBTimestamp {
	return Timestamp.fromMillis(millis);
}
