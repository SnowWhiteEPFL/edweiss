import { Timestamp } from '@/model/time';
import { Timestamp as FBTimestamp } from '@react-native-firebase/firestore';

export namespace Time {
	export function toDate(timestamp: Timestamp): Date {
		const seconds: number = (timestamp as any).seconds;
		const _seconds: number = (timestamp as any)._seconds;
		const millis = (seconds ?? _seconds) * 1000;
		return FBTimestamp.fromMillis(millis).toDate();
	}
}
