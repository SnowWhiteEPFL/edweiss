import { GeoPoint, Timestamp } from '@react-native-firebase/firestore';

export type FBGeoPoint = GeoPoint;
export type FBTimestamp = Timestamp;

export function Now(): FBTimestamp {
	return Timestamp.now();
}

export function TimestampFromMillis(millis: number) {
	return Timestamp.fromMillis(millis);
}
